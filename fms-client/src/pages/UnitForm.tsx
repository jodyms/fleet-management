import { useState, useEffect } from "react";
// import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/db";
import { useNavigate, useParams } from "react-router-dom";
import { Save, Truck, ArrowLeft, Trash2 } from "lucide-react";

export function UnitForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = Boolean(id);

    const [cnUnit, setCnUnit] = useState("");
    const [model, setModel] = useState("");
    const [unitClass, setUnitClass] = useState("");
    const [egi, setEgi] = useState("");
    const [statusSpare, setStatusSpare] = useState(false);

    // Load data if edit mode
    useEffect(() => {
        if (id) {
            db.units.get(Number(id)).then((unit) => {
                if (unit) {
                    setCnUnit(unit.cn_unit);
                    setModel(unit.model);
                    setUnitClass(unit.class);
                    setEgi(unit.egi);
                    setStatusSpare(unit.status_spare);
                }
            });
        }
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const payload = {
                cn_unit: cnUnit,
                model,
                class: unitClass,
                egi,
                status_spare: statusSpare
            };

            if (isEditMode && id) {
                await db.units.update(Number(id), payload);
                alert("Unit updated successfully!");
            } else {
                await db.units.add(payload);
                alert("Unit added successfully!");
            }
            navigate("/units");
        } catch (error) {
            console.error("Failed to save unit:", error);
            alert("Error saving unit. Code Unit might be duplicated.");
        }
    };

    const handleDelete = async () => {
        if (!id || !confirm("Are you sure you want to delete this unit?")) return;

        await db.units.delete(Number(id));
        navigate("/units");
    };

    return (
        <div className="max-w-md mx-auto pb-20">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => navigate("/units")} className="p-2 hover:bg-gray-100 rounded-full">
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Truck className="w-6 h-6 text-blue-600" />
                    {isEditMode ? "Edit Unit" : "Add New Unit"}
                </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">Code Unit (CN)</label>
                    <input
                        type="text"
                        className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="e.g. DT-001"
                        value={cnUnit}
                        onChange={(e) => setCnUnit(e.target.value)}
                        required
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">Model</label>
                    <input
                        type="text"
                        className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="e.g. SCANIA P460"
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700">Class</label>
                        <input
                            type="text"
                            className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="e.g. DUMP TRUCK"
                            value={unitClass}
                            onChange={(e) => setUnitClass(e.target.value)}
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700">EGI</label>
                        <input
                            type="text"
                            className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="e.g. EGI-01"
                            value={egi}
                            onChange={(e) => setEgi(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <div className="flex items-center gap-3 p-3 bg-white border border-gray-300 rounded-lg">
                        <input
                            type="checkbox"
                            id="status_spare"
                            checked={statusSpare}
                            onChange={(e) => setStatusSpare(e.target.checked)}
                            className="w-5 h-5 accent-blue-600"
                        />
                        <label htmlFor="status_spare" className="text-gray-700 font-medium cursor-pointer">
                            Set as SPARE Unit
                        </label>
                    </div>
                </div>

                <div className="flex flex-col gap-3 pt-4">
                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
                    >
                        <Save className="w-5 h-5" />
                        {isEditMode ? "Update Unit" : "Save New Unit"}
                    </button>

                    {isEditMode && (
                        <button
                            type="button"
                            onClick={handleDelete}
                            className="w-full bg-red-100 hover:bg-red-200 text-red-700 font-bold py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                            <Trash2 className="w-5 h-5" />
                            Delete Unit
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}
