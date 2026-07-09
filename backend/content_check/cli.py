"""Command-line entry point for content freshness detection.

Usage (from backend/):
    python -m content_check.cli [--strict] [--today YYYY-MM-DD]

Exit codes:
    0  no error-severity findings (needs-review alone does not fail unless --strict)
    1  at least one error finding, or (with --strict) any needs-review finding
"""

import argparse
from datetime import date

from content_check.checker import evaluate
from content_check.collectors import (
    collect_compare_items,
    collect_lab_items,
    collect_radar_items,
)
from content_check.models import SEVERITY_ERROR, SEVERITY_NEEDS_REVIEW, Finding


def run(today: date, strict: bool = False) -> tuple[list[Finding], int]:
    """Collect every content surface, evaluate, and compute the exit code."""
    items = collect_radar_items() + collect_lab_items() + collect_compare_items()
    findings = evaluate(items, today=today)

    has_error = any(f.severity == SEVERITY_ERROR for f in findings)
    has_needs_review = any(f.severity == SEVERITY_NEEDS_REVIEW for f in findings)
    exit_code = 1 if has_error or (strict and has_needs_review) else 0
    return findings, exit_code


def format_report(findings: list[Finding]) -> str:
    """Render a grouped, human-readable report."""
    if not findings:
        return "Content freshness check passed: all content is compliant."

    severity_rank = {SEVERITY_ERROR: 0, SEVERITY_NEEDS_REVIEW: 1}
    ordered = sorted(
        findings,
        key=lambda f: (severity_rank.get(f.severity, 2), f.kind, f.item_id),
    )

    lines = ["Content freshness findings:", ""]
    for f in ordered:
        lines.append(f"[{f.severity.upper()}] {f.kind}:{f.item_id} {f.rule} — {f.message}")
        lines.append(f"        origin: {f.origin}")

    error_count = sum(1 for f in findings if f.severity == SEVERITY_ERROR)
    review_count = sum(1 for f in findings if f.severity == SEVERITY_NEEDS_REVIEW)
    lines.append("")
    lines.append(f"Summary: {error_count} error(s), {review_count} needs-review.")
    return "\n".join(lines)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        prog="content-check",
        description="Detect stale or non-compliant content across Radar/Labs/Compare.",
    )
    parser.add_argument(
        "--strict",
        action="store_true",
        help="Treat needs-review findings as failures (exit 1).",
    )
    parser.add_argument(
        "--today",
        type=date.fromisoformat,
        default=date.today(),
        help="Override today's date (YYYY-MM-DD) for reproducible runs.",
    )
    args = parser.parse_args(argv)

    findings, exit_code = run(today=args.today, strict=args.strict)
    print(format_report(findings))
    return exit_code


if __name__ == "__main__":
    raise SystemExit(main())
