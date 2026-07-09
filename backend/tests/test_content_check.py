from datetime import date

from content_check.models import parse_content_date


def test_parse_content_date_handles_date_and_iso_datetime():
    assert parse_content_date("2026-07-09") == date(2026, 7, 9)
    assert parse_content_date("2026-07-08T09:00:00Z") == date(2026, 7, 8)
    assert parse_content_date("") is None
    assert parse_content_date(None) is None
    assert parse_content_date("not-a-date") is None
