import { useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/db";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Calculator, TrendingUp, AlertCircle } from "lucide-react";

export function Dashboard() {
    const [filterDays, setFilterDays] = useState(30);

    const units = useLiveQuery(() => db.units.toArray()) ?? [];
    const hmLogs = useLiveQuery(() => db.hm_logs.toArray()) ?? [];
    const bdLogs = useLiveQuery(() => db.breakdown_logs.toArray()) ?? [];

    const kpiData = useMemo(() => {
        if (!units.length) return [];

        return units.map(unit => {
            // 1. Calculate Working Hours (WH)
            // For simplicity in this offline MVP, we sum up the 'hm_value' differences or just count entries
            // Real-world: Sort logs, subtract latest - earliest in period. 
            // Simplified: We'll assume user inputs "Daily Hours" in hm_value for now? 
            // Wait, the HM form inputs "Current Hour Meter" (cumulative).
            // So WH = Max(HM) - Min(HM) in the period.

            const unitHMs = hmLogs
                .filter(l => l.unit_id === unit.id)
                .sort((a, b) => a.hm_value - b.hm_value);

            let wh = 0;
            if (unitHMs.length > 1) {
                wh = unitHMs[unitHMs.length - 1].hm_value - unitHMs[0].hm_value;
            }

            // 2. Calculate Breakdown Hours (BD)
            const unitBDs = bdLogs.filter(b => b.unit_id === unit.id);
            let bdHours = 0;

            unitBDs.forEach(bd => {
                const start = new Date(bd.start_date).getTime();
                const end = bd.end_date ? new Date(bd.end_date).getTime() : new Date().getTime(); // If not closed, count until now
                const diffHours = (end - start) / (1000 * 60 * 60);
                bdHours += diffHours;
            });

            // 3. Formula: MA = WH / (WH + BD)
            // This is a standard approximation if Standby is not tracked separately
            const totalHours = wh + bdHours;
            const ma = totalHours > 0 ? (wh / totalHours) * 100 : 100;

            // 4. PA = (Total Possible Time - BD) / Total Possible Time
            // We'll estimate Total Possible Time as 24h * filterDays for now
            const totalPeriodHours = filterDays * 24;
            const pa = ((totalPeriodHours - bdHours) / totalPeriodHours) * 100;

            return {
                name: unit.cn_unit,
                MA: Math.min(Math.round(ma * 10) / 10, 100), // Cap at 100
                PA: Math.min(Math.round(pa * 10) / 10, 100),
                wh: Math.round(wh),
                bd: Math.round(bdHours)
            };
        });
    }, [units, hmLogs, bdLogs, filterDays]);

    return (
        <div className="space-y-6 pb-20">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Calculator className="w-6 h-6 text-blue-600" />
                    Fleet Performance
                </h2>
                <select
                    className="text-sm border border-gray-300 rounded-lg p-2 bg-white"
                    value={filterDays}
                    onChange={(e) => setFilterDays(Number(e.target.value))}
                >
                    <option value={7}>Last 7 Days</option>
                    <option value={30}>Last 30 Days</option>
                </select>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-xs font-medium uppercase">Avg MA</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                        {kpiData.length ? Math.round(kpiData.reduce((a, b) => a + b.MA, 0) / kpiData.length) : 0}%
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-xs font-medium uppercase">Avg PA</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                        {kpiData.length ? Math.round(kpiData.reduce((a, b) => a + b.PA, 0) / kpiData.length) : 0}%
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 h-80">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Availability by Unit</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={kpiData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} />
                        <YAxis axisLine={false} tickLine={false} fontSize={12} domain={[0, 100]} />
                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Legend iconType="circle" fontSize={10} />
                        <Bar dataKey="MA" name="Mech. Avail" fill="#2563eb" radius={[4, 4, 0, 0]}>
                            {kpiData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.MA < 85 ? '#ef4444' : '#2563eb'} />
                            ))}
                        </Bar>
                        <Bar dataKey="PA" name="Phys. Avail" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Detailed Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
                        <tr>
                            <th className="px-4 py-3 font-medium">Unit</th>
                            <th className="px-4 py-3 font-medium text-right">WH</th>
                            <th className="px-4 py-3 font-medium text-right">BD (Hr)</th>
                            <th className="px-4 py-3 font-medium text-right">MA</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {kpiData.map((d) => (
                            <tr key={d.name} className="hover:bg-gray-50/50">
                                <td className="px-4 py-3 font-medium text-gray-900">{d.name}</td>
                                <td className="px-4 py-3 text-right font-mono text-gray-600">{d.wh}</td>
                                <td className="px-4 py-3 text-right font-mono text-red-600">{d.bd}</td>
                                <td className={`px-4 py-3 text-right font-bold ${d.MA < 85 ? 'text-red-600' : 'text-blue-600'}`}>
                                    {d.MA}%
                                </td>
                            </tr>
                        ))}
                        {!kpiData.length && (
                            <tr>
                                <td colSpan={4} className="px-4 py-8 text-center text-gray-400">No Data Available</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
