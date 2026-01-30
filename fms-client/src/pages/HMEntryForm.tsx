import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/db";
import { useNavigate } from "react-router-dom";
import { Save, AlertCircle, History } from "lucide-react";
import clsx from "clsx";

export function HMEntryForm() {
    const navigate = useNavigate();
    const [selectedUnitId, setSelectedUnitId] = useState<number | "">("");
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [shift, setShift] = useState<"Day" | "Night">("Day");
    const [hmValue, setHmValue] = useState<string>("");
    const [error, setError] = useState<string | null>(null);

    // Fetch all units for dropdown
    const units = useLiveQuery(() => db.units.toArray());

    // Fetch last HM for validation
    const lastLog = useLiveQuery(
        async () => {
            if (!selectedUnitId) return null;
            return db.hm_logs
                .where("unit_id")
                .equals(selectedUnitId)
                .reverse()
                .sortBy("hm_value")
                .then((logs) => logs[0]);
        },
        [selectedUnitId]
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUnitId || !hmValue) return;

        const currentHM = parseFloat(hmValue);

        // Validation: Check if HM is valid
        if (lastLog && currentHM < lastLog.hm_value) {
            setError(`HM cannot be less than previous recording (${lastLog.hm_value})`);
            return;
        }

        try {
            await db.hm_logs.add({
                unit_id: Number(selectedUnitId),
                date,
                shift,
                hm_value: currentHM,
                is_synced: false,
                created_at: new Date().toISOString(),
            });

            // Reset form or redirect
            alert("HM Saved Successfully!");
            navigate("/");
        } catch (err) {
            console.error(err);
            setError("Failed to save data. It might be a duplicate entry.");
        }
    };

    return (
        <div className="max-w-md mx-auto">
            <h2 className="text-xl font-bold mb-6 text-gray-800">Input Daily HM</h2>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Unit Selection */}
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">Select Unit</label>
                    <select
                        className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        value={selectedUnitId}
                        onChange={(e) => {
                            setSelectedUnitId(Number(e.target.value));
                            setError(null);
                        }}
                        required
                    >
                        <option value="">-- Choose Unit --</option>
                        {units?.map((u) => (
                            <option key={u.id} value={u.id}>
                                {u.cn_unit} - {u.model}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Date & Shift */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700">Date</label>
                        <input
                            type="date"
                            className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700">Shift</label>
                        <select
                            className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={shift}
                            onChange={(e) => setShift(e.target.value as "Day" | "Night")}
                        >
                            <option value="Day">Day</option>
                            <option value="Night">Night</option>
                        </select>
                    </div>
                </div>

                {/* Last HM Display */}
                {selectedUnitId && (
                    <div className="bg-blue-50 p-4 rounded-lg flex items-center justify-between border border-blue-100">
                        <div className="flex items-center gap-2 text-blue-700">
                            <History className="w-5 h-5" />
                            <span className="text-sm font-medium">Last HM Record</span>
                        </div>
                        <span className="text-lg font-bold text-blue-800">
                            {lastLog ? lastLog.hm_value.toLocaleString() : "N/A"}
                        </span>
                    </div>
                )}

                {/* HM Input */}
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">Current Hour Meter</label>
                    <input
                        type="number"
                        step="0.1"
                        className={clsx(
                            "w-full p-3 bg-white border rounded-lg focus:ring-2 outline-none text-lg font-mono",
                            error
                                ? "border-red-300 focus:ring-red-200 focus:border-red-500 text-red-900"
                                : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                        )}
                        placeholder="0.0"
                        value={hmValue}
                        onChange={(e) => {
                            setHmValue(e.target.value);
                            setError(null);
                        }}
                        required
                    />
                    {error && (
                        <div className="flex items-center gap-1.5 text-red-600 text-sm mt-1 animate-in slide-in-from-top-1">
                            <AlertCircle className="w-4 h-4" />
                            <span>{error}</span>
                        </div>
                    )}
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={!selectedUnitId || !hmValue}
                    className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Save className="w-5 h-5" />
                    Save HM Data
                </button>
            </form>
        </div>
    );
}
