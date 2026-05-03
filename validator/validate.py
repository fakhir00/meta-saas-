import json
from pathlib import Path

import jsonschema
import sqlparse

SCHEMA_DIR = Path(__file__).resolve().parents[1] / 'schemas'


def validate_req_doc(data: dict) -> list[str]:
    errors = []
    if not data.get('business_intent', {}).get('value'):
        errors.append('business_intent.value missing')
    features = data.get('core_features', [])
    if len(features) < 3:
        errors.append(f'Need >= 3 core_features, got {len(features)}')
    must_haves = [f for f in features if f.get('priority') == 'must_have']
    if len(must_haves) < 1:
        errors.append('Need >= 1 must_have feature')
    if not data.get('user_personas'):
        errors.append('user_personas array is empty')
    if not data.get('saas_type'):
        errors.append('saas_type missing')
    return errors


def validate_against_schema(data: dict, schema_name: str) -> list[str]:
    schema_path = SCHEMA_DIR / f'{schema_name}.schema.json'
    with schema_path.open('r', encoding='utf-8') as handle:
        schema = json.load(handle)

    validator = jsonschema.Draft202012Validator(schema)
    errors = []
    for error in sorted(validator.iter_errors(data), key=lambda item: list(item.absolute_path)):
        path = '.'.join(str(part) for part in error.absolute_path) or '<root>'
        errors.append(f'{path}: {error.message}')
    return errors


def validate_sql(sql_text: str) -> list[str]:
    errors = []
    statements = sqlparse.parse(sql_text)
    if not statements:
        return ['No SQL statements found']

    if sql_text.count('(') != sql_text.count(')'):
        errors.append('SQL has unbalanced parentheses')

    single_quotes = sql_text.count("'") - sql_text.count("''") * 2
    if single_quotes % 2 != 0:
        errors.append('SQL has unclosed single quotes')

    double_quotes = sql_text.count('"')
    if double_quotes % 2 != 0:
        errors.append('SQL has unclosed double quotes')

    lowered = sql_text.lower()
    if 'password' in lowered or 'passwd' in lowered:
        errors.append('SQL must not include hardcoded password values')
    if "'admin'" in lowered or '"admin"' in lowered:
        errors.append('SQL must not include hardcoded admin credentials')

    for index, statement in enumerate(statements, start=1):
        text = str(statement).strip()
        if not text:
            errors.append(f'Statement {index} is empty')
            continue
        statement_type = statement.get_type()
        if statement_type == 'UNKNOWN':
            normalized = ' '.join(text.split())
            if normalized and normalized != ';':
                errors.append(f'Statement {index} has UNKNOWN type: {normalized[:120]}')
    return errors
