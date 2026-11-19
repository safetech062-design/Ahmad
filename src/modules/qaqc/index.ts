import type { ToolDef } from '../commands/types';

/**
 * QA/QC Expansion Module (Phase 5) - ARCHITECTURE ONLY, nothing below is implemented.
 *
 * It stays separate from the assistant core. To add a feature later:
 *  1. implement a QaqcDataSource (local Excel register, or an HTTP backend),
 *  2. write ToolDefs (e.g. qaqc_open_ncrs, qaqc_overdue_inspections),
 *  3. add them to `qaqcTools` - the planner, executor and allow-list pick them up automatically.
 */
export type QaqcRecordKind = 'NCR' | 'WIR' | 'MIR' | 'ConcreteTest' | 'AggregateTest';

export interface QaqcFeature {
  id: string;
  title: string;
  implemented: boolean;
}

export const QAQC_FEATURES: QaqcFeature[] = [
  { id: 'ncr', title: 'NCR tracking and internal NCR register', implemented: false },
  { id: 'wir', title: 'WIR tracking', implemented: false },
  { id: 'mir', title: 'MIR tracking', implemented: false },
  { id: 'inspection', title: 'Inspection tracking and overdue alerts', implemented: false },
  { id: 'tests', title: 'Material / concrete / aggregate testing registers', implemented: false },
  { id: 'excel', title: 'Excel import and analysis', implemented: false },
  { id: 'dashboard', title: 'Dashboards, trend and line charts', implemented: false },
  { id: 'reports', title: 'Monthly reports', implemented: false },
  { id: 'docs', title: 'Document revision tracking and management', implemented: false },
];

/** Where QA/QC records come from. */
export interface QaqcDataSource {
  id: string;
  kind: 'local-excel' | 'http-backend';
  list(kind: QaqcRecordKind, filter?: Record<string, unknown>): Promise<Record<string, unknown>[]>;
}

export const qaqcTools: ToolDef[] = [
  {
    name: 'qaqc_status',
    description:
      'Use for ANY QA/QC request (NCRs, WIR, MIR, inspections, test registers, dashboards, monthly QA/QC report). The QA/QC module is not built yet; this reports that honestly.',
    args: '{}',
    async run() {
      return {
        code: 'unsupported',
        detail: `QA/QC module is planned for Phase 5. Planned: ${QAQC_FEATURES.map((f) => f.title).join('; ')}.`,
      };
    },
  },
];
