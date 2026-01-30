import Dexie, { type EntityTable } from 'dexie';

// Define Interface Types
export interface Unit {
    id: number;
    cn_unit: string; // Code Unit (e.g., DT-01)
    model: string;   // e.g., SCANIA P460 cb 8x4
    class: string;   // e.g., DUMP TRUCK
    egi: string;
    status_spare: boolean;
}

export interface Component {
    id: number;
    system: string;
    section: string;
    sub_component: string;
}

export interface HMLog {
    id: number;
    unit_id: number;
    date: string; // YYYY-MM-DD
    shift: 'Day' | 'Night';
    hm_value: number;
    is_synced: boolean;
    created_at: string;
}

export interface BreakdownLog {
    id: number;
    unit_id: number;
    component_id?: number;
    start_date: string; // ISO String
    end_date?: string;  // ISO String (RFU)
    trouble_desc: string;
    downtime_category: 'SCM' | 'USM';
    is_synced: boolean;
    created_at: string;
}

// Define Database
const db = new Dexie('FMS_OfflineDB') as Dexie & {
    units: EntityTable<Unit, 'id'>;
    components: EntityTable<Component, 'id'>;
    hm_logs: EntityTable<HMLog, 'id'>;
    breakdown_logs: EntityTable<BreakdownLog, 'id'>;
};

// Schema Definition
db.version(1).stores({
    units: '++id, cn_unit, model, class', // Indexes
    components: '++id, system, section, sub_component',
    hm_logs: '++id, unit_id, date, shift, [unit_id+date+shift]', // Compound index for duplicate check
    breakdown_logs: '++id, unit_id, start_date'
});

export { db };
