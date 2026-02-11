import { Link } from "react-router-dom";
import { GlobalSearchContainer } from "@/containers/search/GlobalSearch";
import { BurgerMenu } from "@/components/sidebar/BurgerMenu";
import { useSidebar } from "@/components/sidebar/useSidebar";

import logoTransparent from "../../assets/Logo transparent.png";

export function PageHeader({
  showSearch = true,
  className = "",
}) {
  const { isMobile } = useSidebar();

  return (
    <div
      className={`page-header mb-6 flex items-center gap-4 border-b border-gray-200 pb-4 dark:border-gray-800 ${className}`}
    >
      {/* Burger menu on mobile only (sidebar is fully hidden) */}
      {isMobile && <BurgerMenu />}

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
