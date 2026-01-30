import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./layouts/Layout";
import { UnitListPage } from "./pages/UnitList";
import { UnitForm } from "./pages/UnitForm";
import { HMEntryForm } from "./pages/HMEntryForm";
import { BreakdownForm } from "./pages/BreakdownForm";
import { Dashboard } from "./pages/Dashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="units" element={<UnitListPage />} />
          <Route path="units/new" element={<UnitForm />} />
          <Route path="units/edit/:id" element={<UnitForm />} />
          <Route path="input-hm" element={<HMEntryForm />} />
          <Route path="breakdown" element={<BreakdownForm />} />
          <Route path="settings" element={<div className="p-4 text-center text-gray-400">Settings Coming Soon</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
