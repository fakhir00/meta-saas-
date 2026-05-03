from typing import Any

import chainlit as cl

from pipeline.orchestrator import project_context_markdown, rerun_from, run_pipeline, ui_preview_markdown
from pipeline.state import fresh_state


def state() -> dict[str, Any]:
    current = cl.user_session.get("metabox_state")
    if current is None:
        current = fresh_state()
        cl.user_session.set("metabox_state", current)
    return current


def _priority_label(priority: str) -> str:
    return {
        "must_have": "Must Have",
        "should_have": "Should Have",
        "nice_to_have": "Nice to Have",
    }.get(priority, priority.replace("_", " ").title())


def _table(headers: list[str], rows: list[list[str]]) -> str:
    head = "| " + " | ".join(headers) + " |"
    sep = "| " + " | ".join("---" for _ in headers) + " |"
    body = "\n".join("| " + " | ".join(cell.replace("\n", " ") for cell in row) + " |" for row in rows)
    return "\n".join([head, sep, body]) if body else "\n".join([head, sep])


def build_export(session_state: dict[str, Any]) -> str:
    stages = session_state["stages"]
    req = stages.get("req_doc") or {}
    spec = stages.get("build_spec") or {}
    features = stages.get("features") or {}
    api = stages.get("api_spec") or {}
    schema = stages.get("schema_sql") or {}
    ui = stages.get("ui_spec") or {}

    core_features = req.get("core_features", [])
    feature_lines = [
        f"- **{_priority_label(item.get('priority', ''))}:** {item.get('name', '')} — {item.get('description', '')}"
        for item in core_features
    ]
    entities = spec.get("entity_model", [])
    entity_lines = []
    for entity in entities:
        fields = ", ".join(f"{field.get('name')} ({field.get('type')})" for field in entity.get("fields", []))
        entity_lines.append(f"- **{entity.get('entity', '')}:** {fields}")

    pages = ui.get("pages", [])
    page_lines = [
        f"- **{page.get('name', '')}:** {page.get('purpose', '')} Components: {', '.join(page.get('components', []))}"
        for page in pages
    ]

    endpoint_rows = [
        [item.get("method", ""), item.get("path", ""), item.get("description", "")]
        for item in api.get("endpoints", [])
    ]

    return (
        f"# {req.get('product_title', 'MetaBox Spec')}\n\n"
        f"## Overview\n"
        f"**Business Goal:** {req.get('business_intent', {}).get('value', '')}\n\n"
        f"**SaaS Type:** {req.get('saas_type', '')}\n\n"
        f"**Personas:**\n"
        + "\n".join(f"- **{p.get('name', '')}:** {p.get('description', '')}" for p in req.get("user_personas", []))
        + "\n\n## Features\n"
        + "\n".join(feature_lines)
        + "\n\n## Architecture\n"
        + f"**Tech Stack:** {spec.get('tech_stack', {})}\n\n"
        + f"**Deployment:** {spec.get('deployment_config', {})}\n\n"
        + "## Expanded Feature Plan\n"
        + "\n".join(
            f"- **{item.get('name', '')}:** {len(item.get('subtasks', []))} steps"
            for item in features.get("expanded_features", [])
        )
        + "\n\n## API Endpoints\n"
        + _table(["Method", "Path", "Description"], endpoint_rows)
        + "\n\n## Data Model\n"
        + "\n".join(entity_lines)
        + "\n\n## SQL\n"
        + f"```sql\n{schema.get('sql', '')}\n```\n\n"
        + "## Pages\n"
        + "\n".join(page_lines)
    )


def build_final_summary(session_state: dict[str, Any]) -> str:
    stages = session_state["stages"]
    req = stages["req_doc"]
    spec = stages["build_spec"]
    api = stages["api_spec"]
    ui = stages["ui_spec"]

    personas = "\n".join(
        f"- **{item.get('name', '')}:** {item.get('description', '')}"
        for item in req.get("user_personas", [])
    )
    monetization = req.get("monetization", {})
    grouped: dict[str, list[str]] = {"must_have": [], "should_have": [], "nice_to_have": []}
    for item in req.get("core_features", []):
        grouped.setdefault(item.get("priority", ""), []).append(
            f"- **{item.get('name', '')}:** {item.get('description', '')}"
        )
    feature_blocks = "\n\n".join(
        f"**{_priority_label(priority)}**\n" + ("\n".join(lines) if lines else "- None")
        for priority, lines in grouped.items()
    )

    stack = spec.get("tech_stack", {})
    deployment = spec.get("deployment_config", {})
    endpoint_rows = [
        [item.get("method", ""), item.get("path", ""), item.get("description", "")]
        for item in api.get("endpoints", [])
    ]
    entities = "\n".join(
        f"- **{entity.get('entity', '')}:** "
        + ", ".join(f"{field.get('name')} ({field.get('type')})" for field in entity.get("fields", []))
        for entity in spec.get("entity_model", [])
    )
    pages = "\n".join(
        f"- **{page.get('name', '')}:** {page.get('purpose', '')}\n  Components: {', '.join(page.get('components', []))}"
        for page in ui.get("pages", [])
    )

    return (
        "## Your MetaBox Spec Is Complete 🎉\n\n"
        "<details open><summary>📋 Overview</summary>\n\n"
        f"**Product:** {req.get('product_title', '')}\n\n"
        f"**Personas:**\n{personas}\n\n"
        f"**Monetization:** {monetization.get('model', '')} — {', '.join(monetization.get('tiers', []))}\n"
        "</details>\n\n"
        "<details><summary>⭐ Features</summary>\n\n"
        f"{feature_blocks}\n"
        "</details>\n\n"
        "<details><summary>🏗️ Architecture</summary>\n\n"
        f"- Frontend: {stack.get('frontend', '')}\n"
        f"- Backend: {stack.get('backend', '')}\n"
        f"- Database: {stack.get('database', '')}\n"
        f"- Auth: {stack.get('auth', '')}\n\n"
        f"Deployment: {deployment}\n"
        "</details>\n\n"
        "<details><summary>🔌 API Endpoints</summary>\n\n"
        f"{_table(['Method', 'Path', 'Description'], endpoint_rows)}\n"
        "</details>\n\n"
        "<details><summary>🗄️ Data Model</summary>\n\n"
        f"{entities}\n"
        "</details>\n\n"
        "<details><summary>🖼️ Pages</summary>\n\n"
        f"{pages}\n"
        "</details>\n\n"
        "Your MetaBox spec is complete! All agent outputs are saved in this session.\n"
        "Type **`export`** to get a Markdown copy of your full spec.\n"
        "Type **`edit [agent name]`** to re-run any specific agent with new instructions."
    )


async def send_confirmation(session_state: dict[str, Any]) -> None:
    intake = session_state["intake"]
    await cl.Message(
        author="🤖 MetaBox",
        content=(
            "Here's what I'll work with:\n"
            f"- **Idea:** {intake['idea_text']}\n"
            f"- **Audience:** {intake['audience']}\n"
            f"- **Budget:** {intake['budget_range']}\n\n"
            "Ready to build your spec? Click **🚀 Start Building** or type any corrections."
        ),
        actions=[
            cl.Action(name="start_building", payload={"value": "start"}, label="🚀 Start Building"),
        ],
    ).send()
    await send_project_sidebar(session_state)


async def send_project_sidebar(session_state: dict[str, Any]) -> None:
    context_md = project_context_markdown(session_state)
    # Only send if there's actual content beyond the header
    if context_md.strip() and "Completed outputs: None" not in context_md:
        await cl.Message(
            author="📌 Project Context",
            content=context_md,
        ).send()


def final_workspace_elements(session_state: dict[str, Any]) -> list:
    stages = session_state["stages"]
    elements: list = [
        cl.Text(
            name="full_spec.md",
            content=build_export(session_state),
            display="page",
            language="markdown",
        ),
    ]
    for key, value in stages.items():
        if not value:
            continue
        language = "sql" if key == "schema_sql" else "json"
        name = "schema.sql" if key == "schema_sql" else f"{key}.json"
        content = value.get("sql", "") if key == "schema_sql" else __import__("json").dumps(value, indent=2)
        elements.append(cl.Text(name=name, content=content, display="page", language=language))
    if stages.get("ui_spec"):
        elements.append(
            cl.Text(
                name="ui_preview.md",
                content=ui_preview_markdown(stages["ui_spec"]),
                display="page",
                language="markdown",
            )
        )
    return elements


async def start_pipeline() -> None:
    session_state = state()
    try:
        await run_pipeline(session_state)
        await cl.Message(
            content=build_final_summary(session_state),
            author="🎉 MetaBox",
            elements=final_workspace_elements(session_state),
        ).send()
    except Exception as exc:
        session_state["pipeline_status"] = "failed"
        await cl.Message(content=f"⚠️ MetaBox pipeline stopped: {exc}", author="🤖 MetaBox").send()


@cl.on_chat_start
async def on_chat_start() -> None:
    session_state = fresh_state()
    cl.user_session.set("metabox_state", session_state)
    await cl.Message(
        author="🤖 MetaBox",
        content=(
            "Welcome to MetaBox! I'm going to help you turn your business idea into a complete "
            "product specification. Let's start with your idea. **Describe your business in 1–3 "
            "sentences.** What problem does it solve and who is it for?"
        ),
    ).send()


@cl.action_callback("start_building")
async def on_start_building(action: cl.Action) -> None:
    await action.remove()
    await start_pipeline()


@cl.on_message
async def on_message(message: cl.Message) -> None:
    session_state = state()
    text = message.content.strip()
    lowered = text.lower()

    if lowered == "export":
        if session_state["pipeline_status"] != "complete":
            await cl.Message(content="The spec is not complete yet. Run the pipeline first.", author="🤖 MetaBox").send()
            return
        await cl.Message(content=build_export(session_state), author="🎉 MetaBox").send()
        return

    if lowered.startswith("edit "):
        if session_state["pipeline_status"] not in {"complete", "failed"}:
            await cl.Message(content="Please wait until the current pipeline step finishes before rerunning an agent.", author="🤖 MetaBox").send()
            return
        agent = text.split(" ", 1)[1].strip()
        response = await cl.AskUserMessage(
            content=f"What would you like to change about the {agent} output?",
            author="🤖 MetaBox",
            timeout=3600,
        ).send()
        instruction = response.get("output", "").strip() if response else ""
        if not instruction:
            await cl.Message(content="No edit instruction received.", author="🤖 MetaBox").send()
            return
        try:
            await rerun_from(session_state, agent, instruction)
            await cl.Message(content=build_final_summary(session_state), author="🎉 MetaBox").send()
        except Exception as exc:
            await cl.Message(content=f"⚠️ MetaBox rerun stopped: {exc}", author="🤖 MetaBox").send()
        return

    step = session_state.get("intake_step", "idea")
    if step == "idea":
        session_state["intake"]["idea_text"] = text
        session_state["intake_step"] = "audience"
        await cl.Message(
            content="Got it! Who is your primary target customer? *(e.g. freelancers, small businesses, enterprise teams, consumers)*",
            author="🤖 MetaBox",
        ).send()
        await send_project_sidebar(session_state)
        return

    if step == "audience":
        session_state["intake"]["audience"] = text
        session_state["intake_step"] = "budget"
        await cl.Message(
            content="Last one: what's your expected monthly budget to run this product? *(e.g. $0 free tools only / under $50 / $50–200 / $200+)*",
            author="🤖 MetaBox",
        ).send()
        await send_project_sidebar(session_state)
        return

    if step == "budget":
        session_state["intake"]["budget_range"] = text
        session_state["intake_step"] = "confirm"
        await send_confirmation(session_state)
        return

    if step == "confirm":
        session_state["intake"]["idea_text"] = f"{session_state['intake']['idea_text']}\nCorrection: {text}"
        await send_confirmation(session_state)
        return

    await cl.Message(content="I heard you. Use `export` or `edit [agent name]` once your spec is complete.", author="🤖 MetaBox").send()
