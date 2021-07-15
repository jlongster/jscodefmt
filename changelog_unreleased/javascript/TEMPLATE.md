##### Break multiline parenthesized logical expressions by [@alex12058](https://github.com/alex12058)

<!-- prettier-ignore -->
```jsx
// Input
const funnelSnapshotCard =
  (report === MY_OVERVIEW && !ReportGK.xar_metrics_active_capitol_v2) ||
  (
    report === COMPANY_OVERVIEW &&
    !ReportGK.xar_metrics_active_capitol_v2_company_metrics
  ) ? (
    <ReportMetricsFunnelSnapshotCard metrics={metrics} />
  ) : null;

// Prettier stable
const funnelSnapshotCard =
  (report === MY_OVERVIEW && !ReportGK.xar_metrics_active_capitol_v2) ||
  (report === COMPANY_OVERVIEW &&
    !ReportGK.xar_metrics_active_capitol_v2_company_metrics) ? (
    <ReportMetricsFunnelSnapshotCard metrics={metrics} />
  ) : null;

// Prettier main
const funnelSnapshotCard =
  (report === MY_OVERVIEW && !ReportGK.xar_metrics_active_capitol_v2) ||
  (
    report === COMPANY_OVERVIEW &&
    !ReportGK.xar_metrics_active_capitol_v2_company_metrics
  ) ? (
    <ReportMetricsFunnelSnapshotCard metrics={metrics} />
  ) : null;
```
