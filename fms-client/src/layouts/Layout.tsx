import { Link, Outlet, useLocation } from "react-router-dom";
import { LayoutDashboard, PenTool, ClipboardList, Settings } from "lucide-react";
import clsx from "clsx";

export function Layout() {
    const location = useLocation();

    const navItems = [
        { icon: LayoutDashboard, label: "Dashboard", path: "/" },
        { icon: ClipboardList, label: "Units", path: "/units" },
        { icon: PenTool, label: "Input HM", path: "/input-hm" },
        { icon: Settings, label: "Breakdown", path: "/breakdown" },
    ];

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold text-gray-800">FMS Offline</h1>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-xs text-gray-500 font-medium">Online</span>
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-4 pb-24">
                <Outlet />
            </main>

            <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 safe-area-bottom">
                <div className="flex justify-around items-center">
                    {navItems.map(({ icon: Icon, label, path }) => {
                        const isActive = location.pathname === path;
                        return (
                            <Link
                                key={path}
                                to={path}
                                className={clsx(
                                    "flex flex-col items-center py-3 px-4 w-full transition-colors",
                                    isActive
                                        ? "text-blue-600 bg-blue-50/50"
                                        : "text-gray-400 hover:text-gray-600 active:bg-gray-50"
                                )}
                            >
                                <Icon className={clsx("w-6 h-6 mb-1", isActive && "fill-current")} />
                                <span className="text-[10px] font-medium">{label}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}
