from common.i18n import DEFAULT_LOCALE, resolve_locale


def test_resolve_locale_collapses_localized_leaf():
    assert resolve_locale({"zh": "你好", "en": "hello"}, "zh-CN") == "你好"
    assert resolve_locale({"zh": "你好", "en": "hello"}, "en-US") == "hello"


def test_resolve_locale_defaults_unknown_locale_to_zh():
    assert resolve_locale({"zh": "你好", "en": "hello"}, "fr-FR") == "你好"


def test_resolve_locale_recurses_through_nested_dicts_and_lists():
    value = {
        "title": {"zh": "标题", "en": "Title"},
        "id": "stable-id",
        "items": [
            {"name": {"zh": "一", "en": "One"}},
            {"name": {"zh": "二", "en": "Two"}},
        ],
    }

    resolved = resolve_locale(value, "en-US")

    assert resolved == {
        "title": "Title",
        "id": "stable-id",
        "items": [{"name": "One"}, {"name": "Two"}],
    }


def test_default_locale_is_chinese():
    assert DEFAULT_LOCALE == "zh-CN"
