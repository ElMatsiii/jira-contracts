// Original file: protos/sprints.proto

export const AlertSeverity = {
  ALERT_SEVERITY_UNSPECIFIED: 'ALERT_SEVERITY_UNSPECIFIED',
  ALERT_SEVERITY_INFO: 'ALERT_SEVERITY_INFO',
  ALERT_SEVERITY_WARNING: 'ALERT_SEVERITY_WARNING',
  ALERT_SEVERITY_CRITICAL: 'ALERT_SEVERITY_CRITICAL',
} as const;

export type AlertSeverity =
  | 'ALERT_SEVERITY_UNSPECIFIED'
  | 0
  | 'ALERT_SEVERITY_INFO'
  | 1
  | 'ALERT_SEVERITY_WARNING'
  | 2
  | 'ALERT_SEVERITY_CRITICAL'
  | 3

export type AlertSeverity__Output = typeof AlertSeverity[keyof typeof AlertSeverity]
