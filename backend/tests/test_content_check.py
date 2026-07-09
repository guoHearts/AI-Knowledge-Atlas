from datetime import date

from content_check.checker import STALE_AFTER_DAYS, evaluate
from content_check.models import (
    SEVERITY_ERROR,
    SEVERITY_NEEDS_REVIEW,
    ContentItem,
    parse_content_date,
)


def _item(**overrides) -> ContentItem:
    base = dict(
        id="sample",
        kind="lab",
        status="Verified",
        last_verified=date(2026, 7, 1),
        has_official_source=True,
        source_count=1,
        origin="sample",
        ci_status=None,
        path_exists=True,
    )
    base.update(overrides)
    return ContentItem(**base)


def _rules(findings):
    return {f.rule for f in findings}


def test_parse_content_date_handles_date_and_iso_datetime():
    assert parse_content_date("2026-07-09") == date(2026, 7, 9)
    assert parse_content_date("2026-07-08T09:00:00Z") == date(2026, 7, 8)
    assert parse_content_date("") is None
    assert parse_content_date(None) is None
    assert parse_content_date("not-a-date") is None


TODAY = date(2026, 7, 9)


def test_clean_verified_item_has_no_findings():
    assert evaluate([_item()], today=TODAY) == []


def test_verified_item_older_than_90_days_is_needs_review():
    stale = _item(last_verified=TODAY.replace(month=1, day=1))  # >90 days earlier
    findings = evaluate([stale], today=TODAY)
    assert (TODAY - date(2026, 1, 1)).days > STALE_AFTER_DAYS
    assert _rules(findings) == {"stale-needs-review"}
    assert findings[0].severity == SEVERITY_NEEDS_REVIEW


def test_verified_item_missing_official_source_is_error():
    findings = evaluate([_item(has_official_source=False, source_count=1)], today=TODAY)
    assert "missing-official-source" in _rules(findings)
    assert all(f.severity == SEVERITY_ERROR for f in findings)


def test_verified_item_with_failing_ci_is_error():
    findings = evaluate([_item(ci_status="failing")], today=TODAY)
    assert "ci-failed-but-verified" in _rules(findings)
    assert all(f.severity == SEVERITY_ERROR for f in findings)


def test_invalid_status_is_error():
    findings = evaluate([_item(status="unknown")], today=TODAY)
    assert "missing-status" in _rules(findings)
    assert findings[0].severity == SEVERITY_ERROR


def test_verified_item_missing_verification_date_is_error():
    findings = evaluate([_item(last_verified=None)], today=TODAY)
    assert "missing-verification-date" in _rules(findings)


def test_lab_with_missing_path_is_error():
    findings = evaluate([_item(path_exists=False)], today=TODAY)
    assert "missing-lab-path" in _rules(findings)


def test_draft_item_is_exempt_from_stale_rule():
    old_draft = _item(status="Draft", last_verified=date(2025, 1, 1))
    findings = evaluate([old_draft], today=TODAY)
    assert "stale-needs-review" not in _rules(findings)
