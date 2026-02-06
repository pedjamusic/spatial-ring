import { Link } from "react-router-dom";
import { BurgerMenu } from "../sidebar/BurgerMenu";
import { GlobalSearchContainer } from "@/containers/search/GlobalSearch";

import { H1 } from "../typography/H1";

export function PageHeader({
  title,
  subtitle,
  showSearch = true,
  className = "",
}) {
  return (
    <div
      className={`mb-6 flex items-center gap-4 border-b border-gray-200 pb-4 dark:border-gray-800 ${className}`}
    >
      {/* Left: Logo + Title */}
      <div className="flex min-w-0 items-center gap-1">
        <Link to="/admin" className="flex-shrink-0">
          <img
            src="/src/assets/Logo transparent.png"
            alt="Spatial Ring - Home"
            className="h-10 w-10"
          />
        </Link>
        <div className="flex min-w-0 flex-col">
          <H1>{title}</H1>
          {subtitle && (
            <p className="truncate text-sm text-gray-600 dark:text-gray-400">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Center: Search */}
      {showSearch && (
        <div className="flex min-w-0 max-w-md flex-1">
          <GlobalSearchContainer />
        </div>
      )}

      {/* Right: Burger menu (mobile/tablet only) */}
      <div className="ml-auto flex gap-2">
        <BurgerMenu />
        {/* User menu can go here later */}
      </div>
    </div>
  );
}
