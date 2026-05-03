import asyncio
import json
from collections.abc import Awaitable, Callable
from typing import Any

import chainlit as cl

from pipeline.agents import api_agent, db_agent, feature_agent, prompt_agent, requirement_agent, ui_agent

StageRunner = Callable[..., Awaitable[tuple[dict, dict]]]

STAGE_INFO = {
    "req_doc": {
        "agent": "Requirement Agent",
        "author": "🧠 Requirements Analyst",
        "role": "Mapping your idea",
        "input": "business idea, target audience, and budget",
    },
    "build_spec": {
        "agent": "Prompt Agent",
        "author": "🏗️ System Architect",
        "role": "Building your blueprint",
        "input": "approved requirements",
    },
    "features": {
        "agent": "Feature Agent",
        "author": "📋 Feature Planner",
        "role": "Planning your features",
        "input": "feature tree and tech stack",
    },
    "api_spec": {
        "agent": "API Agent",
        "author": "🔌 API Designer",
        "role": "Designing your endpoints",
        "input": "API surface and entity model",
    },
    "schema_sql": {
        "agent": "DB Agent",
        "author": "🗄️ Database Architect",
        "role": "Structuring your data",
        "input": "entity model and database target",
    },
    "ui_spec": {
        "agent": "UI Agent",
        "author": "🖼️ UI Strategist",
        "role": "Laying out your pages",
        "input": "features, API surface, and feature plan",
    },
}


def _bullets(items: list[str], limit: int = 6) -> str:
    if not items:
        return "- None yet"
    return "\n".join(f"- {item}" for item in items[:limit])


def _meta_line(meta: dict) -> str:
    return f"*Completed in {meta['elapsed']}s · {meta['model']} · Attempt {meta['attempt']}*"


def _json_block(value: object) -> str:
    return json.dumps(value, indent=2, ensure_ascii=False)


def handoff_summary(stage_key: str) -> str:
    if stage_key == "req_doc":
        return "Next handoff: System Architect receives the approved requirements JSON."
    if stage_key == "build_spec":
        return "Next handoff: Feature Planner, API Designer, and Database Architect receive scoped slices of this build spec in parallel."
    if stage_key in {"features", "api_spec", "schema_sql"}:
        return "Next handoff: UI Strategist uses the feature plan plus API surface after the parallel stage is approved."
    if stage_key == "ui_spec":
        return "Final handoff: MetaBox renders the complete approved spec and enables export/reruns."
    return "Next handoff: the approved output is saved in session state."


def project_context_markdown(session_state: dict[str, Any]) -> str:
    intake = session_state.get("intake", {})
    edits = session_state.get("human_edits", [])
    stages = session_state.get("stages", {})
    completed = [key for key, value in stages.items() if value]
    edit_lines = [
        f"- {item.get('action', 'edit')} at {item.get('checkpoint', '')}: {item.get('instruction', '')}"
        for item in edits
    ]
    return (
        "# Project Context\n\n"
        f"**Idea:** {intake.get('idea_text') or 'Not captured yet'}\n\n"
        f"**Audience:** {intake.get('audience') or 'Not captured yet'}\n\n"
        f"**Budget:** {intake.get('budget_range') or 'Not captured yet'}\n\n"
        f"**Completed outputs:** {', '.join(completed) if completed else 'None yet'}\n\n"
        "## Human Requirements / Edits\n"
        f"{chr(10).join(edit_lines) if edit_lines else '- None yet'}"
    )


def pipeline_status_markdown(session_state: dict[str, Any], active_stage: str | None = None) -> str:
    stage_order = ["req_doc", "build_spec", "features", "api_spec", "schema_sql", "ui_spec"]
    stages = session_state.get("stages", {})
    
    lines = ["# Pipeline Progress\n"]
    for key in stage_order:
        label = STAGE_INFO[key]["agent"]
        if active_stage == key:
            status = "🔄 Running"
        elif stages.get(key):
            status = "✅ Complete"
        else:
            status = "⏳ Pending"
        lines.append(f"- {status} — {label}")
    
    return "\n".join(lines)



def stage_handoff_markdown(stage_key: str, output: dict, meta: dict) -> str:
    human_instruction = meta.get("human_instruction") or "None"
    return (
        f"# {STAGE_INFO[stage_key]['agent']} Handoff\n\n"
        f"**State key:** `{stage_key}`\n\n"
        f"**What it received:** {STAGE_INFO[stage_key]['input']}\n\n"
        f"**Human instruction applied:** {human_instruction}\n\n"
        f"**Next step:** {handoff_summary(stage_key)}\n\n"
        "## Approved Output Summary\n\n"
        f"{summarize_stage(stage_key, output)}"
    )


def ui_preview_markdown(output: dict) -> str:
    pages = output.get("pages", [])
    page_blocks: list[str] = ["# UI Prototype Preview\n"]
    for page in pages:
        components = "\n".join(f"  - {item}" for item in page.get("components", []))
        data_sources = ", ".join(page.get("data_sources", []))
        page_blocks.append(
            f"## {page.get('name', 'Page')}\n\n"
            f"{page.get('purpose', '')}\n\n"
            "```text\n"
            "+--------------------------------------+\n"
            f"| {page.get('name', 'Page')[:36]:<36} |\n"
            "+--------------------------------------+\n"
            "| Header / navigation                  |\n"
            "| Main content and workspace           |\n"
            "| Actions, lists, forms, or cards      |\n"
            "+--------------------------------------+\n"
            "```\n\n"
            f"**Components**\n{components or '- None'}\n\n"
            f"**Data sources:** {data_sources or 'None'}\n"
        )
    return "\n\n".join(page_blocks)


def stage_elements(session_state: dict[str, Any], stage_key: str, output: dict, meta: dict) -> list:
    elements: list = [
        cl.Text(
            name="pipeline_status.md",
            content=pipeline_status_markdown(session_state, stage_key),
            display="page",
            language="markdown",
        ),
        cl.Text(
            name=f"{stage_key}.json",
            content=_json_block(output),
            display="page",
            language="json",
        ),
    ]
    if stage_key == "schema_sql":
        elements.append(
            cl.Text(
                name="schema.sql",
                content=output.get("sql", ""),
                display="page",
                language="sql",
            )
        )
    if stage_key == "ui_spec":
        elements.append(
            cl.Text(
                name="ui_preview.md",
                content=ui_preview_markdown(output),
                display="page",
                language="markdown",
            )
        )
    return elements


def summarize_stage(stage_key: str, output: dict) -> str:
    if stage_key == "req_doc":
        personas = [
            f"{item.get('name', 'Persona')}, {item.get('description', '')}"
            for item in output.get("user_personas", [])
        ]
        must_haves = [
            item.get("name", "Unnamed feature")
            for item in output.get("core_features", [])
            if item.get("priority") == "must_have"
        ]
        monetization = output.get("monetization", {})
        return (
            f"**Product:** {output.get('product_title', 'Untitled')}\n"
            f"**Type:** {output.get('saas_type', 'SaaS')}\n"
            f"**Business Goal:** {output.get('business_intent', {}).get('value', '')}\n\n"
            f"**👥 User Personas:**\n{_bullets(personas)}\n\n"
            f"**⭐ Core Features (Must Have):**\n{_bullets(must_haves)}\n\n"
            f"**💰 Monetization:**\n"
            f"- {monetization.get('model', 'Not specified')}: {', '.join(monetization.get('tiers', []))}"
        )

    if stage_key == "build_spec":
        features = [item.get("name", "Feature") for item in output.get("feature_tree", [])]
        entities = [item.get("entity", "Entity") for item in output.get("entity_model", [])]
        stack = output.get("tech_stack", {})
        deploy = output.get("deployment_config", {})
        return (
            f"**Feature Tree:**\n{_bullets(features)}\n\n"
            f"**Data Entities:**\n{_bullets(entities)}\n\n"
            f"**🏗️ Tech Stack:**\n"
            f"- Frontend: {stack.get('frontend', '')}\n"
            f"- Backend: {stack.get('backend', '')}\n"
            f"- Database: {stack.get('database', '')}\n"
            f"- Auth: {stack.get('auth', '')}\n\n"
            f"**Deployment:** {deploy.get('frontend_hosting', '')} + "
            f"{deploy.get('backend_hosting', '')} + {deploy.get('database', '')}"
        )

    if stage_key == "features":
        features = []
        for item in output.get("expanded_features", []):
            steps = item.get("subtasks", [])
            features.append(f"{item.get('name', 'Feature')} ({len(steps)} steps)")
        return f"**Expanded Features:**\n{_bullets(features, 10)}"

    if stage_key == "api_spec":
        endpoints = [
            f"`{item.get('method', '')} {item.get('path', '')}` - {item.get('description', '')}"
            for item in output.get("endpoints", [])
        ]
        return f"**Endpoints:**\n{_bullets(endpoints, 10)}"

    if stage_key == "schema_sql":
        sql = output.get("sql", "")
        statements = [part.strip() for part in sql.split(";") if part.strip()]
        tables = [line for line in statements if line.lower().startswith("create table")]
        return (
            f"**PostgreSQL Schema:**\n"
            f"- {len(tables)} tables detected\n"
            f"- {len(statements)} SQL statements generated\n"
            f"- SQL is available in the Markdown export"
        )

    if stage_key == "ui_spec":
        pages = [
            f"{item.get('name', 'Page')} - {item.get('purpose', '')}"
            for item in output.get("pages", [])
        ]
        return f"**Pages:**\n{_bullets(pages, 10)}"

    return "Output generated."


async def send_stage_message(session_state: dict[str, Any], stage_key: str, output: dict, meta: dict) -> None:
    info = STAGE_INFO[stage_key]
    attempt_note = "" if meta["attempt"] == 1 else f"\n\n⚠️ Attempt {meta['attempt']} of 2"
    content = (
        f"### {info['author']} — Complete ✅\n"
        f"{_meta_line(meta)}{attempt_note}\n\n"
        f"**Role:** {info['role']}\n"
        f"**Received:** {info['input']}\n\n"
        f"**Produced:**\n{summarize_stage(stage_key, output)}\n\n"
        "Open the attached workspace files to inspect the output, handoff notes, and project context."
    )
    await cl.Message(
        content=content,
        author=info["author"],
        elements=stage_elements(session_state, stage_key, output, meta),
    ).send()


async def run_stage(
    session_state: dict[str, Any],
    stage_key: str,
    runner: Callable[[str | None], Awaitable[tuple[dict, dict]]],
    human_instruction: str | None = None,
) -> None:
    info = STAGE_INFO[stage_key]
    status_md = pipeline_status_markdown(session_state, stage_key)
    await cl.Message(
        content=f"Starting: **{info['role']}**\n\nReceived: {info['input']}\n\n{status_md}",
        author=info["author"],
    ).send()

    while True:
        try:
            output, meta = await runner(human_instruction)
            session_state["stages"][stage_key] = output
            session_state["stage_meta"][stage_key] = meta
            await send_stage_message(session_state, stage_key, output, meta)
            return
        except Exception as exc:
            session_state["pipeline_status"] = "failed"
            response = await cl.AskActionMessage(
                content=f"⚠️ {info['agent']} encountered an error: {exc}",
                author=info["author"],
                actions=[
                    cl.Action(name="retry_stage", payload={"value": "retry"}, label="Retry"),
                ],
                timeout=3600,
                raise_on_timeout=False,
            ).send()
            if response and response.get("payload", {}).get("value") == "retry":
                session_state["pipeline_status"] = "running"
                continue
            raise


async def human_checkpoint(session_state: dict[str, Any], checkpoint_key: str, stage_keys: list[str]) -> None:
    session_state["pipeline_status"] = "awaiting_review"
    title = " + ".join(STAGE_INFO[key]["author"] for key in stage_keys)
    sections: list[str] = []
    for key in stage_keys:
        meta = session_state["stage_meta"][key]
        output = session_state["stages"][key]
        sections.append(
            f"---\n### {STAGE_INFO[key]['author']} — Complete ✅\n"
            f"{_meta_line(meta)}\n\n"
            f"{summarize_stage(key, output)}"
        )

    response = await cl.AskActionMessage(
        content="\n\n".join(sections) + "\n\n---\nWhat would you like to do?",
        author=title,
        actions=[
            cl.Action(name="checkpoint_continue", payload={"value": "continue"}, label="✅ Looks good — continue"),
            cl.Action(name="checkpoint_edit", payload={"value": "edit"}, label="✏️ Edit this output"),
            cl.Action(name="checkpoint_add", payload={"value": "add"}, label="➕ Add a requirement"),
        ],
        timeout=3600,
        raise_on_timeout=False,
    ).send()

    value = response.get("payload", {}).get("value") if response else "continue"
    if value == "continue":
        session_state["pipeline_status"] = "running"
        return

    prompt = (
        "What would you like changed?"
        if value == "edit"
        else "What requirement would you like to add before we continue?"
    )
    user_input = await cl.AskUserMessage(content=prompt, author="🤖 MetaBox", timeout=3600).send()
    instruction = user_input.get("output", "").strip() if user_input else ""
    if not instruction:
        session_state["pipeline_status"] = "running"
        return

    session_state["human_edits"].append(
        {
            "checkpoint": checkpoint_key,
            "action": value,
            "instruction": instruction,
            "stages": stage_keys,
        }
    )

    if value == "edit":
        await cl.Message(
            content=f"Re-running from {title} due to human edit.",
            author="🤖 MetaBox",
        ).send()
        session_state["pipeline_status"] = "running"
        for key in stage_keys:
            await run_stage_by_key(session_state, key, instruction)
        await human_checkpoint(session_state, checkpoint_key, stage_keys)
        return

    session_state["pending_instruction"] = instruction
    session_state["pipeline_status"] = "running"


async def run_stage_by_key(
    session_state: dict[str, Any],
    stage_key: str,
    human_instruction: str | None = None,
) -> None:
    if stage_key == "req_doc":
        await run_stage(
            session_state,
            stage_key,
            lambda note: requirement_agent.run(session_state["intake"], note),
            human_instruction,
        )
    elif stage_key == "build_spec":
        await run_stage(
            session_state,
            stage_key,
            lambda note: prompt_agent.run(session_state["stages"]["req_doc"], note),
            human_instruction,
        )
    elif stage_key == "features":
        await run_stage(
            session_state,
            stage_key,
            lambda note: feature_agent.run(session_state["stages"]["build_spec"], note),
            human_instruction,
        )
    elif stage_key == "api_spec":
        await run_stage(
            session_state,
            stage_key,
            lambda note: api_agent.run(session_state["stages"]["build_spec"], note),
            human_instruction,
        )
    elif stage_key == "schema_sql":
        await run_stage(
            session_state,
            stage_key,
            lambda note: db_agent.run(session_state["stages"]["build_spec"], note),
            human_instruction,
        )
    elif stage_key == "ui_spec":
        await run_stage(
            session_state,
            stage_key,
            lambda note: ui_agent.run(
                session_state["stages"]["build_spec"],
                session_state["stages"]["features"],
                note,
            ),
            human_instruction,
        )
    else:
        raise RuntimeError(f"Unknown stage: {stage_key}")


def consume_pending_instruction(session_state: dict[str, Any]) -> str | None:
    instruction = session_state.get("pending_instruction")
    session_state["pending_instruction"] = None
    return instruction


async def run_parallel_stages(session_state: dict[str, Any], human_instruction: str | None = None) -> None:
    await asyncio.gather(
        run_stage_by_key(session_state, "features", human_instruction),
        run_stage_by_key(session_state, "api_spec", human_instruction),
        run_stage_by_key(session_state, "schema_sql", human_instruction),
    )


async def run_pipeline(session_state: dict[str, Any]) -> None:
    session_state["pipeline_status"] = "running"
    await run_stage_by_key(session_state, "req_doc", consume_pending_instruction(session_state))
    await human_checkpoint(session_state, "stage_1", ["req_doc"])

    await run_stage_by_key(session_state, "build_spec", consume_pending_instruction(session_state))
    await human_checkpoint(session_state, "stage_2", ["build_spec"])

    await run_parallel_stages(session_state, consume_pending_instruction(session_state))
    await human_checkpoint(session_state, "stage_3_parallel", ["features", "api_spec", "schema_sql"])

    await run_stage_by_key(session_state, "ui_spec", consume_pending_instruction(session_state))
    await human_checkpoint(session_state, "stage_6", ["ui_spec"])
    session_state["pipeline_status"] = "complete"


async def rerun_from(session_state: dict[str, Any], agent_name: str, instruction: str) -> None:
    normalized = agent_name.lower().strip()
    aliases = {
        "requirement": "req_doc",
        "requirements": "req_doc",
        "req": "req_doc",
        "prompt": "build_spec",
        "build": "build_spec",
        "spec": "build_spec",
        "features": "features",
        "feature": "features",
        "api": "api_spec",
        "database": "schema_sql",
        "db": "schema_sql",
        "schema": "schema_sql",
        "ui": "ui_spec",
        "pages": "ui_spec",
    }
    start = aliases.get(normalized)
    if not start:
        raise RuntimeError(f"Unknown agent name: {agent_name}")

    session_state["human_edits"].append(
        {"checkpoint": "command", "action": "edit", "instruction": instruction, "stages": [start]}
    )
    await cl.Message(
        content=f"Re-running from {STAGE_INFO[start]['agent']} due to human edit.",
        author="🤖 MetaBox",
    ).send()

    if start == "req_doc":
        await run_stage_by_key(session_state, "req_doc", instruction)
        await run_stage_by_key(session_state, "build_spec")
        await run_parallel_stages(session_state)
        await run_stage_by_key(session_state, "ui_spec")
    elif start == "build_spec":
        await run_stage_by_key(session_state, "build_spec", instruction)
        await run_parallel_stages(session_state)
        await run_stage_by_key(session_state, "ui_spec")
    elif start == "features":
        await run_stage_by_key(session_state, "features", instruction)
        await run_stage_by_key(session_state, "ui_spec")
    elif start == "api_spec":
        await run_stage_by_key(session_state, "api_spec", instruction)
        await run_stage_by_key(session_state, "ui_spec")
    elif start == "schema_sql":
        await run_stage_by_key(session_state, "schema_sql", instruction)
    elif start == "ui_spec":
        await run_stage_by_key(session_state, "ui_spec", instruction)
    session_state["pipeline_status"] = "complete"
