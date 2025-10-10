import { Link, Outlet, useLocation } from "react-router-dom";

export default function AdminLayout() {
  const { pathname } = useLocation();
  const title = pathname.startsWith("/admin/warehouses")
    ? "Warehouses"
    : pathname.startsWith("/admin/assets")
      ? "Assets"
      : pathname.startsWith("/admin/events")
        ? "Events"
        : pathname.startsWith("/admin/movements")
          ? "Movements"
          : "Dashboard";

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside style={{ width: 240, padding: 16 }}>
        {/* Breadcrumb  */}
        <div class="sticky top-0 inset-x-0 z-20 bg-white border-y border-gray-200 px-4 sm:px-6 lg:px-8 lg:hidden dark:bg-neutral-800 dark:border-neutral-700">
          <div class="flex items-center py-2">
            {/* Navigation Toggle  */}
            <button
              type="button"
              class="size-8 flex justify-center items-center gap-x-2 border border-gray-200 text-gray-800 hover:text-gray-500 rounded-lg focus:outline-hidden focus:text-gray-500 disabled:opacity-50 disabled:pointer-events-none dark:border-neutral-700 dark:text-neutral-200 dark:hover:text-neutral-500 dark:focus:text-neutral-500"
              aria-haspopup="dialog"
              aria-expanded="false"
              aria-controls="hs-application-sidebar"
              aria-label="Toggle navigation"
              data-hs-overlay="#hs-application-sidebar"
            >
              <span class="sr-only">Toggle Navigation</span>
              <svg
                class="shrink-0 size-4"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M15 3v18" />
                <path d="m8 9 3 3-3 3" />
              </svg>
            </button>
            {/* End Navigation Toggle */}
            {/* Breadcrumb */}
            <ol class="ms-3 flex items-center whitespace-nowrap">
              <li class="flex items-center text-sm text-gray-800 dark:text-neutral-400">
                Application Layout
                <svg
                  class="shrink-0 mx-3 overflow-visible size-2.5 text-gray-400 dark:text-neutral-500"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5 1L10.6869 7.16086C10.8637 7.35239 10.8637 7.64761 10.6869 7.83914L5 14"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                  />
                </svg>
              </li>
              <li
                class="text-sm font-semibold text-gray-800 truncate dark:text-neutral-400"
                aria-current="page"
              >
                Dashboard
              </li>
            </ol>
            End Breadcrumb
          </div>
        </div>
        {/* End Breadcrumb  */}
        <h2 style={{ marginTop: 0 }}>Admin</h2>
        <nav style={{ display: "grid", gap: 8 }}>
          <Link to="/admin">Dashboard</Link>
          <Link to="/admin/warehouses">Warehouses</Link>
          <Link to="/admin/assets">Assets</Link>
          <Link to="/admin/assetCategories">Asset Categories</Link>
          <Link to="/admin/events">Events</Link>
          <Link to="/admin/eventLocations">Event Locations</Link>
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
