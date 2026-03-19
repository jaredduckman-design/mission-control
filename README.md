# Mission Control — Paper Trading Ops Quickstart

This directory contains templates + scripts to keep daily paper-trading logs consistent and reconcilable.

## Daily workflow (2 commands)

```bash
cd mission-control
./scripts/scaffold-paper-trading-day.sh YYYY-MM-DD
./scripts/check-paper-trading-hygiene.sh YYYY-MM-DD
```

If no date is provided, scripts default to today.

## What gets created

- `paper-trading-trades-YYYY-MM-DD.md`
- `paper-trading-performance-YYYY-MM-DD.md`
- `paper-trading-reconciliation-YYYY-MM-DD.md`

## Hygiene checker exit codes

- `0` = pass (no warnings/fails)
- `1` = warnings only (usually placeholders/date carryovers still present)
- `2` = fail (blocking integrity issue)

## Supporting docs

- `paper-trading-hygiene-checklist.md`
- `paper-trading-reconciliation-fast-path.md`
- Daily templates (`paper-trading-daily-*.md`)
