import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import RequireAuth from "./components/RequireAuth";

import AdminLayout from "./layouts/AdminLayout";

import Login from "./pages/Login";
import Logout from "./pages/Logout";

import AdminHome from "./pages/AdminHome";
import Warehouses from "./pages/Warehouses";
import AssetCategories from "./pages/AssetCategories";
import Assets from "./pages/Assets";
import Events from "./pages/Events";
import EventLocations from "./pages/EventLocations";
import Movements from "./pages/Movements";
// Import other CRUD pages as needed

import { AppToastRegion } from "./components/ui/Toast";

export default function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />

          {/* Protected admin routes */}

          <Route
            path="/admin"
            element={
              <RequireAuth>
                <AdminLayout />
              </RequireAuth>
            }
          >
            <Route index element={<AdminHome />} />
            <Route path="warehouses" element={<Warehouses />} />
            <Route path="assetCategories" element={<AssetCategories />} />
            <Route path="assets" element={<Assets />} />
            <Route path="eventLocations" element={<EventLocations />} />
            <Route path="events" element={<Events />} />
            <Route path="movements" element={<Movements />} />
            {/* Add more CRUD pages similarly */}
          </Route>

          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </BrowserRouter>
      <AppToastRegion />
    </>
  );
}
