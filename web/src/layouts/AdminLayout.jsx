import { Link, Outlet, useLocation } from "react-router-dom";

export default function AdminLayout() {
  const { pathname } = useLocation();
  const title = pathname.startsWith("/admin/locations")
    ? "Locations"
    : pathname.startsWith("/admin/assets")
    ? "Assets"
    : pathname.startsWith("/admin/events")
    ? "Events"
    : pathname.startsWith("/admin/movements")
    ? "Movements"
    : "Dashboard";

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside style={{ width: 240, borderRight: "1px solid #eee", padding: 16 }}>
        <h2 style={{ marginTop: 0 }}>Admin</h2>
        <nav style={{ display: "grid", gap: 8 }}>
          <Link to="/admin">Dashboard</Link>
          <Link to="/admin/locations">Locations</Link>
          <Link to="/admin/assetCategories">Asset Categories</Link>
          <Link to="/admin/assets">Assets</Link>
          <Link to="/admin/events">Events</Link>
          <Link to="/admin/movements">Movements</Link>
        </nav>
      </aside>

      <main style={{ flex: 1, display: "grid", gridTemplateRows: "64px 1fr" }}>
        <header
          style={{
            display: "flex",
            alignItems: "center",
            padding: "0 16px",
            borderBottom: "1px solid #eee",
          }}
        >
          <h1 style={{ margin: 0, fontSize: 18 }}>{title}</h1>
          <div style={{ marginLeft: "auto" }} />
        </header>
        <section style={{ padding: 16, overflow: "auto" }}>
          <Outlet />
        </section>
      </main>
    </div>
  );
}
