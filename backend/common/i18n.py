"""Locale resolution for bilingual content stored as {"zh": ..., "en": ...} leaves.

Content repositories store prose fields as a two-key dict instead of a plain
string. resolve_locale walks a raw dict/list structure and collapses every
such leaf to the string for the requested locale, BEFORE the result is handed
to a Pydantic model — so schemas.py field types stay plain `str` and
content_check's collectors (which read the raw repository data directly and
never touch prose fields) are unaffected.
"""

from typing import Any

SUPPORTED_LOCALES = {"zh-CN", "en-US"}
DEFAULT_LOCALE = "zh-CN"

_LOCALIZED_KEYS = {"zh", "en"}


def resolve_locale(value: Any, locale: str) -> Any:
    if isinstance(value, dict):
        if set(value) == _LOCALIZED_KEYS and all(isinstance(v, str) for v in value.values()):
            return value["en"] if locale.startswith("en") else value["zh"]
        return {key: resolve_locale(item, locale) for key, item in value.items()}
    if isinstance(value, list):
        return [resolve_locale(item, locale) for item in value]
    return value
