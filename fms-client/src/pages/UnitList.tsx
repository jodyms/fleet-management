import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/db";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

export function UnitListPage() {
    const units = useLiveQuery(() => db.units.toArray());

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">My Units</h2>
                <Link to="/units/new" className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-lg shadow-blue-600/30 transition-all">
                    <Plus className="w-6 h-6" />
                </Link>
            </div>

            {!units ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    Loading...
                </div>
            ) : units.length === 0 ? (
                <p className="text-center text-gray-400 py-8">No units found.</p>
            ) : (
                <div className="space-y-3">
                    {units.map((unit) => (
                        <Link
                            to={`/units/edit/${unit.id}`}
                            key={unit.id}
                            className="group bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex justify-between items-center"
                        >
                            <div className="flex flex-col">
                                <span className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
                                    {unit.cn_unit}
                                </span>
                                <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                                    {unit.model}
                                </span>
                            </div>
                            <div className="text-right">
                                <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${unit.status_spare
                                            ? "bg-amber-100 text-amber-800"
                                            : "bg-emerald-100 text-emerald-800"
                                        }`}
                                >
                                    {unit.status_spare ? "SPARE" : "ACTIVE"}
                                </span>
                                <div className="text-xs text-gray-400 mt-1">{unit.class}</div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
