def validate_requirement_output(data: dict) -> list[str]:
    errors: list[str] = []
    if not data.get("business_intent", {}).get("value"):
        errors.append("business_intent.value missing")

    features = data.get("core_features")
    if not isinstance(features, list) or len(features) < 3:
        count = len(features) if isinstance(features, list) else 0
        errors.append(f"core_features must have at least 3 items, got {count}")
    elif not any(item.get("priority") == "must_have" for item in features if isinstance(item, dict)):
        errors.append("core_features must include at least 1 must_have item")

    personas = data.get("user_personas")
    if not isinstance(personas, list) or not personas:
        errors.append("user_personas must be non-empty")
    return errors


def validate_prompt_output(data: dict) -> list[str]:
    errors: list[str] = []
    for key in ["feature_tree", "entity_model", "api_surface", "tech_stack", "deployment_config"]:
        if key not in data:
            errors.append(f"{key} missing")

    feature_tree = data.get("feature_tree")
    if not isinstance(feature_tree, list) or len(feature_tree) < 3:
        count = len(feature_tree) if isinstance(feature_tree, list) else 0
        errors.append(f"feature_tree must have at least 3 items, got {count}")

    entity_model = data.get("entity_model")
    if not isinstance(entity_model, list) or len(entity_model) < 2:
        count = len(entity_model) if isinstance(entity_model, list) else 0
        errors.append(f"entity_model must have at least 2 entities, got {count}")
    return errors


def validate_feature_output(data: dict) -> list[str]:
    items = data.get("expanded_features")
    if not isinstance(items, list) or not items:
        return ["expanded_features array missing or empty"]
    return []


def validate_api_output(data: dict) -> list[str]:
    items = data.get("endpoints")
    if not isinstance(items, list) or not items:
        return ["endpoints array missing or empty"]
    return []


def validate_db_output(data: dict) -> list[str]:
    sql = data.get("sql")
    if not isinstance(sql, str) or len(sql) <= 100:
        return ["sql key must contain a string longer than 100 characters"]

    lowered = sql.lower()
    errors: list[str] = []
    if "password" in lowered or "passwd" in lowered:
        errors.append("SQL must not contain hardcoded password assignments")
    if "'admin'" in lowered or "\"admin\"" in lowered:
        errors.append("SQL must not contain hardcoded admin credentials")

    if sql.count("(") != sql.count(")"):
        errors.append("SQL has unbalanced parentheses")

    single_quotes = sql.count("'") - sql.count("''") * 2
    if single_quotes % 2 != 0:
        errors.append("SQL has unclosed single quotes")

    double_quotes = sql.count('"')
    if double_quotes % 2 != 0:
        errors.append("SQL has unclosed double quotes")

    return errors


def validate_ui_output(data: dict) -> list[str]:
    pages = data.get("pages")
    if not isinstance(pages, list) or len(pages) < 2:
        count = len(pages) if isinstance(pages, list) else 0
        return [f"pages array must have at least 2 items, got {count}"]
    return []

