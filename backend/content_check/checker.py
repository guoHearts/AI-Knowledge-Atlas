"""Content freshness and metadata rules (docs/content-standards.md, 改造方案 §17.2/§17.4)."""

from datetime import date

from content_check.models import (
    SEVERITY_ERROR,
    SEVERITY_NEEDS_REVIEW,
    VALID_STATUSES,
    ContentItem,
    Finding,
)

STALE_AFTER_DAYS = 90

# ciStatus values that indicate a Verified item can no longer stay Verified.
FAILING_CI_STATUSES = {"failing", "failed", "ci-failed"}


def evaluate(items: list[ContentItem], today: date) -> list[Finding]:
    """Apply the content-standards rules to each item.

    A compliant item yields no findings. Draft/Deprecated items are exempt from
    the 90-day needs-review rule but still validated for required metadata.
    """
    findings: list[Finding] = []
    for item in items:
        findings.extend(_evaluate_item(item, today))
    return findings


def _evaluate_item(item: ContentItem, today: date) -> list[Finding]:
    findings: list[Finding] = []

    def add(severity: str, rule: str, message: str) -> None:
        findings.append(
            Finding(
                item_id=item.id,
                kind=item.kind,
                severity=severity,
                rule=rule,
                message=message,
                origin=item.origin,
            )
        )

    if item.status not in VALID_STATUSES:
        add(
            SEVERITY_ERROR,
            "missing-status",
            f"status '{item.status}' is not one of {sorted(VALID_STATUSES)}",
        )

    is_verified = item.status == "Verified"

    if is_verified:
        if item.last_verified is None:
            add(
                SEVERITY_ERROR,
                "missing-verification-date",
                "Verified item has no valid lastVerifiedAt",
            )
        if not item.has_official_source:
            add(
                SEVERITY_ERROR,
                "missing-official-source",
                "Verified item has no official source",
            )
        if item.ci_status and item.ci_status.lower() in FAILING_CI_STATUSES:
            add(
                SEVERITY_ERROR,
                "ci-failed-but-verified",
                f"ciStatus '{item.ci_status}' means it must not remain Verified",
            )

    if item.kind == "lab" and item.path_exists is False:
        add(
            SEVERITY_ERROR,
            "missing-lab-path",
            "lab path does not exist on disk",
        )

    if is_verified and item.last_verified is not None:
        days = (today - item.last_verified).days
        if days > STALE_AFTER_DAYS:
            add(
                SEVERITY_NEEDS_REVIEW,
                "stale-needs-review",
                f"last verified {days} days ago (> {STALE_AFTER_DAYS})",
            )

    return findings
