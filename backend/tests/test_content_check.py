from datetime import date

from content_check.checker import STALE_AFTER_DAYS, evaluate
from content_check.cli import format_report, main, run
from content_check.collectors import (
    collect_compare_items,
    collect_lab_items,
    collect_radar_items,
)
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


# --- collectors ---------------------------------------------------------------


def test_collect_radar_items_maps_official_source():
    items = collect_radar_items()

    assert len(items) >= 5
    assert all(item.kind == "radar" for item in items)
    mcp = next(item for item in items if item.id == "mcp-security-boundary-2026-07")
    assert mcp.has_official_source is True
    assert mcp.last_verified is not None


def test_collect_lab_items_parses_metadata_and_path(tmp_path):
    labs_dir = tmp_path / "labs"
    good = labs_dir / "good-lab"
    good.mkdir(parents=True)
    (good / "metadata.yaml").write_text(
        "id: good-lab\n"
        "status: verified\n"
        "lastVerifiedAt: 2026-07-09\n"
        "path: labs/good-lab\n"
        "sources:\n"
        "  - type: official\n"
        "    url: https://example.com\n"
        "ciStatus: passing\n",
        encoding="utf-8",
    )
    broken = labs_dir / "broken-lab"
    broken.mkdir()
    (broken / "metadata.yaml").write_text(
        "id: broken-lab\n"
        "status: verified\n"
        "lastVerifiedAt: 2026-07-09\n"
        "path: labs/does-not-exist\n"
        "sources:\n"
        "  - type: community\n"
        "    url: https://example.com\n",
        encoding="utf-8",
    )

    items = {item.id: item for item in collect_lab_items(labs_dir, repo_root=tmp_path)}

    assert items["good-lab"].kind == "lab"
    assert items["good-lab"].status == "verified" or items["good-lab"].status == "Verified"
    assert items["good-lab"].has_official_source is True
    assert items["good-lab"].path_exists is True
    assert items["broken-lab"].has_official_source is False
    assert items["broken-lab"].path_exists is False


def test_collect_compare_items_reads_frontmatter(tmp_path):
    (tmp_path / "with-fm.md").write_text(
        "---\n"
        "title: Sample\n"
        "status: verified\n"
        "lastVerifiedAt: 2026-07-07\n"
        "sources:\n"
        "  - type: official-doc\n"
        "    url: https://example.com\n"
        "---\n\n# Body\n",
        encoding="utf-8",
    )
    (tmp_path / "no-fm.md").write_text("# No frontmatter here\n", encoding="utf-8")

    items = collect_compare_items(tmp_path)

    ids = {item.id for item in items}
    assert "with-fm" in ids
    assert "no-fm" not in ids
    fm = next(item for item in items if item.id == "with-fm")
    assert fm.kind == "compare"
    assert fm.last_verified == date(2026, 7, 7)


# --- cli / exit codes ---------------------------------------------------------


def test_run_on_real_repo_today_has_no_error_findings():
    findings, exit_code = run(today=date(2026, 7, 9))

    errors = [f for f in findings if f.severity == SEVERITY_ERROR]
    assert errors == [], f"unexpected error findings: {[f.rule for f in errors]}"
    assert exit_code == 0
    known_rules = {
        "missing-status",
        "missing-verification-date",
        "missing-official-source",
        "ci-failed-but-verified",
        "missing-lab-path",
        "stale-needs-review",
    }
    assert all(f.rule in known_rules for f in findings)


def test_run_in_far_future_flags_stale_and_strict_fails():
    future = date(2027, 1, 1)
    findings, exit_code = run(today=future)
    assert any(f.rule == "stale-needs-review" for f in findings)
    # needs-review alone does not fail CI unless --strict.
    assert exit_code == 0

    _, strict_code = run(today=future, strict=True)
    assert strict_code == 1


def test_main_strict_far_future_returns_1():
    assert main(["--today", "2027-01-01", "--strict"]) == 1


def test_main_today_returns_0():
    assert main(["--today", "2026-07-09"]) == 0


def test_format_report_handles_empty_findings():
    assert "passed" in format_report([]).lower()
