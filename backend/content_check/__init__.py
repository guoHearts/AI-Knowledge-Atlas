"""Content freshness detection for AI Knowledge Atlas.

Scans trust-bearing content surfaces (Radar items, Labs metadata, tech-comparison
frontmatter), applies the content-standards state-flow rules, and reports stale or
non-compliant content. Detection only — it never rewrites content files.
"""
