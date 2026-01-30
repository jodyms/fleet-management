import { db } from './db';

// Mock Data for Units
const unitsData = [
    { cn_unit: 'DT-001', model: 'SCANIA P460 cb 8x4', class: 'DUMP TRUCK', egi: 'DT-SCANIA', status_spare: false },
    { cn_unit: 'DT-002', model: 'SCANIA P460 cb 8x4', class: 'DUMP TRUCK', egi: 'DT-SCANIA', status_spare: false },
    { cn_unit: 'DT-003', model: 'SCANIA P460 cb 8x4', class: 'DUMP TRUCK', egi: 'DT-SCANIA', status_spare: true },
    { cn_unit: 'EX-001', model: 'KOMATSU PC2000', class: 'EXCAVATOR', egi: 'EX-BIG', status_spare: false },
];

// Mock Data for Components (Simplified)
const componentsData = [
    { system: 'ENGINE', section: 'FUEL SYSTEM', sub_component: 'INJECTION PUMP' },
    { system: 'ENGINE', section: 'COOLING SYSTEM', sub_component: 'RADIATOR' },
    { system: 'HYDRAULIC', section: 'PUMP', sub_component: 'MAIN PUMP' },
    { system: 'TRANSMISSION', section: 'GEARBOX', sub_component: 'CLUTCH' },
];

export const seedDatabase = async () => {
    try {
        const unitsCount = await db.units.count();
        if (unitsCount === 0) {
            await db.units.bulkAdd(unitsData);
            console.log('Units seeded successfully');
        }

        const componentsCount = await db.components.count();
        if (componentsCount === 0) {
            await db.components.bulkAdd(componentsData);
            console.log('Components seeded successfully');
        }
    } catch (error) {
        console.error('Failed to seed database:', error);
    }
};
