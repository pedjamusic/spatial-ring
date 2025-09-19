import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import RequireAuth from "./components/RequireAuth";
import AdminLayout from "./layouts/AdminLayout";
import Login from "./pages/Login";
import AdminHome from "./pages/AdminHome";
import Locations from "./pages/Locations";
import AssetCategories from "./pages/AssetCategories";
import Assets from "./pages/Assets";
import Events from "./pages/Events";
import Movements from "./pages/Movements";
// Import other CRUD pages as needed

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/admin"
          element={
            <RequireAuth>
              <AdminLayout />
            </RequireAuth>
          }
        >
          <Route index element={<AdminHome />} />
          <Route path="locations" element={<Locations />} />
          <Route path="assetCategories" element={<AssetCategories />} />
          <Route path="assets" element={<Assets />} />
          <Route path="events" element={<Events />} />
          <Route path="movements" element={<Movements />} />
          {/* Add more CRUD pages similarly */}
        </Route>

        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
