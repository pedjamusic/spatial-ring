import { Link } from "react-router-dom";
import { GlobalSearchContainer } from "@/containers/search/GlobalSearch";

import logoTransparent from "../../assets/Logo transparent.png";

export function PageHeader({
  showSearch = true,
  className = "",
}) {
  return (
    <div
      className={`page-header mb-6 flex items-center gap-4 border-b border-gray-200 pb-4 dark:border-gray-800 ${className}`}
    >
      {/* Left: Logo */}
      <Link to="/admin" className="flex-shrink-0">
        <img
          src={logoTransparent}
          alt="Spatial Ring - Home"
          className="h-10 w-10"
        />
      </Link>

      {/* Center: Search */}
      {showSearch && (
        <div className="flex min-w-0 max-w-md flex-1">
          <GlobalSearchContainer />
        </div>
      )}
    </div>
  );
}
