import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

import RequireAuth from "./components/RequireAuth";

import { DashboardLayout } from "./layouts/DashboardLayout";

import Login from "./pages/Login";
import Logout from "./pages/Logout";
import AdminHome from "./pages/AdminHome";
import GenericListPage from "./pages/GenericListPage";
import GenericFormPage from "./pages/GenericFormPage";

import { useCrudResources } from "./components/sidebar/useCrudResources";

import { AppToastRegion } from "./components/ui/Toast";

export default function App() {
  const { resources, loading } = useCrudResources();
  const [uiConfigs, setUiConfigs] = useState({});
  const [configsLoaded, setConfigsLoaded] = useState(false);

  // Load default UI configs
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/meta/ui-configs.json");
        if (res.ok) {
          const configs = await res.json();
          setUiConfigs(configs);
        }
      } catch (err) {
        console.warn("Failed to load UI configs, using empty defaults:", err);
      } finally {
        setConfigsLoaded(true);
      }
    })();
  }, []);

  // Shared props builder for resource pages
  const propsFor = (r) => ({
    modelName: r.modelName,
    resourceName: r.resourceName,
    uiConfig: uiConfigs[r.modelName] || {},
    titles: { singular: r.singular || r.title, plural: r.title },
  });

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />

          {/* Protected admin routes are below */}
          <Route
            path="/admin"
            element={
              <RequireAuth>
                <DashboardLayout />
              </RequireAuth>
            }
          >
            <Route index element={<AdminHome />} />
            {!loading &&
              configsLoaded &&
              resources.map((r) => (
                <Route key={r.path} path={r.path}>
                  <Route index element={<GenericListPage {...propsFor(r)} />} />
                  <Route path="new" element={<GenericFormPage {...propsFor(r)} />} />
                  <Route path=":id/edit" element={<GenericFormPage {...propsFor(r)} />} />
                </Route>
              ))}
          </Route>
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </BrowserRouter>
      <AppToastRegion />
    </>
  );
}
