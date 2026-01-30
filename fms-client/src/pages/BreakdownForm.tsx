import { useState, useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/db";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Search, Wrench } from "lucide-react";

export function BreakdownForm() {
    const navigate = useNavigate();
    const [selectedUnitId, setSelectedUnitId] = useState<number | "">("");
    const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 16));
    const [endDate, setEndDate] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState<"SCM" | "USM">("SCM");

    // Component Selection State
    const [componentSearch, setComponentSearch] = useState("");
    const [selectedComponentId, setSelectedComponentId] = useState<number | null>(null);
    const [showComponentList, setShowComponentList] = useState(false);

    // Data Fetching
    const units = useLiveQuery(() => db.units.toArray());
    const allComponents = useLiveQuery(() => db.components.toArray()) || [];

    // Filter components based on search
    const filteredComponents = useMemo(() => {
        if (!componentSearch) return [];
        const lowerSearch = componentSearch.toLowerCase();
        return allComponents.filter(c =>
            c.system.toLowerCase().includes(lowerSearch) ||
            c.sub_component.toLowerCase().includes(lowerSearch) ||
            c.section.toLowerCase().includes(lowerSearch)
        ).slice(0, 10); // Limit results for performance
    }, [componentSearch, allComponents]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUnitId || !selectedComponentId) return;

        try {
            await db.breakdown_logs.add({
                unit_id: Number(selectedUnitId),
                component_id: selectedComponentId,
                start_date: startDate,
                end_date: endDate || undefined, // Optional RFU date
                trouble_desc: description,
                downtime_category: category,
                is_synced: false,
                created_at: new Date().toISOString(),
            });

            alert("Breakdown Event Saved!");
            navigate("/");
        } catch (err) {
            console.error(err);
            alert("Failed to save breakdown event.");
        }
    };

    const selectedComponent = allComponents.find(c => c.id === selectedComponentId);

    return (
        <div className="max-w-md mx-auto pb-10">
            <div className="flex items-center gap-2 mb-6 text-red-600">
                <AlertTriangle className="w-6 h-6" />
                <h2 className="text-xl font-bold text-gray-800">Report Breakdown</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Unit Selection */}
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">Unit ID</label>
                    <select
                        className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                        value={selectedUnitId}
                        onChange={(e) => setSelectedUnitId(Number(e.target.value))}
                        required
                    >
                        <option value="">-- Choose Down Unit --</option>
                        {units?.map((u) => (
                            <option key={u.id} value={u.id}>
                                {u.cn_unit} - {u.model}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Component Search with Autocomplete */}
                <div className="flex flex-col gap-1 relative">
                    <label className="text-sm font-medium text-gray-700">Problem Component</label>

                    {selectedComponent ? (
                        <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800">
                            <div className="flex flex-col">
                                <span className="font-bold">{selectedComponent.sub_component}</span>
                                <span className="text-xs opacity-75">{selectedComponent.system} - {selectedComponent.section}</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => { setSelectedComponentId(null); setComponentSearch(""); }}
                                className="text-xs bg-white px-2 py-1 rounded border border-blue-100 shadow-sm hover:bg-blue-100"
                            >
                                Change
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="relative">
                                <Search className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    className="w-full pl-9 p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                                    placeholder="Search component (e.g. Engine, Pump)..."
                                    value={componentSearch}
                                    onChange={(e) => {
                                        setComponentSearch(e.target.value);
                                        setShowComponentList(true);
                                    }}
                                    onFocus={() => setShowComponentList(true)}
                                />
                            </div>

                            {showComponentList && componentSearch && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
                                    {filteredComponents.length === 0 ? (
                                        <div className="p-3 text-sm text-gray-500 text-center">No components found</div>
                                    ) : (
                                        filteredComponents.map(c => (
                                            <button
                                                key={c.id}
                                                type="button"
                                                className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 transition-colors flex flex-col"
                                                onClick={() => {
                                                    setSelectedComponentId(c.id);
                                                    setShowComponentList(false);
                                                }}
                                            >
                                                <span className="font-medium text-gray-800">{c.sub_component}</span>
                                                <span className="text-xs text-gray-400">{c.system} / {c.section}</span>
                                            </button>
                                        ))
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Date Times */}
                <div className="grid grid-cols-1 gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700">Breakdown Start</label>
                        <input
                            type="datetime-local"
                            className="w-full p-3 bg-white border border-gray-300 rounded-lg"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700">
                            Ready for Use (RFU) - <span className="text-gray-400 font-normal">Optional</span>
                        </label>
                        <input
                            type="datetime-local"
                            className="w-full p-3 bg-white border border-gray-300 rounded-lg"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                </div>

                {/* Category & Description */}
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">Category</label>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 p-3 border rounded-lg w-full has-[:checked]:bg-red-50 has-[:checked]:border-red-200 has-[:checked]:text-red-700 transition-all cursor-pointer">
                            <input
                                type="radio"
                                name="category"
                                value="SCM"
                                checked={category === "SCM"}
                                onChange={() => setCategory("SCM")}
                                className="accent-red-600 w-4 h-4"
                            />
                            <div className="flex flex-col">
                                <span className="font-bold text-sm">Scheduled (SCM)</span>
                            </div>
                        </label>
                        <label className="flex items-center gap-2 p-3 border rounded-lg w-full has-[:checked]:bg-orange-50 has-[:checked]:border-orange-200 has-[:checked]:text-orange-700 transition-all cursor-pointer">
                            <input
                                type="radio"
                                name="category"
                                value="USM"
                                checked={category === "USM"}
                                onChange={() => setCategory("USM")}
                                className="accent-orange-600 w-4 h-4"
                            />
                            <div className="flex flex-col">
                                <span className="font-bold text-sm">Unscheduled (USM)</span>
                            </div>
                        </label>
                    </div>
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">Trouble Description</label>
                    <textarea
                        className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none h-24 resize-none"
                        placeholder="Describe the issue..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    />
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={!selectedUnitId || !selectedComponentId || !description}
                    className="w-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-red-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Wrench className="w-5 h-5" />
                    Log Breakdown
                </button>
            </form>
        </div>
    );
}
