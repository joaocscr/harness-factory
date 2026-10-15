# Module 8: Observability Dashboard (Bonus)

This module is optional and only becomes relevant once at least 5 real sessions have been logged.

**Prerequisite:** `harness/observability/logs/` contains at least 5 session log files with real data.

**What gets built:**
- A local `index.html` (or a second tab, if a dashboard page already exists) with a "Metrics" view
- Reads session logs directly from `harness/observability/logs/`
- Visualizations: token cost over time, reviewer FAIL rate, hook frequency, pipeline comparison
- No server, no build step; runs locally in the browser

**Why only after real data:**
A dashboard with dummy data doesn't show anything useful. Real data shows what's actually worth watching, and what was initially assumed incorrectly.

**Harness artifact:** `index.html` (or its own file), the metrics dashboard

## Notes For Running This

- If the person asks about this before 5 logs exist, briefly explain why it's worth waiting, and offer to run a real session now instead, to generate data.
