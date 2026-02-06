import { Link } from "react-router-dom";
import { BurgerMenu } from "../sidebar/BurgerMenu";
import { GlobalSearchContainer } from "@/containers/search/GlobalSearch";

export function PageHeader({
  title,
  subtitle,
  showSearch = true,
  className = ""
}) {
  return (
    <div className={`mb-6 flex items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-4 ${className}`}>
      {/* Left: Logo + Title */}
      <div className="flex items-center gap-4 min-w-0">
        <Link to="/admin" className="flex-shrink-0">
          <img
            src="/src/assets/Logo transparent.png"
            alt="Spatial Ring - Home"
            className="h-10 w-10"
          />
        </Link>
        <div className="flex flex-col min-w-0">
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Center: Search */}
      {showSearch && (
        <div className="flex flex-1 max-w-md min-w-0">
          <GlobalSearchContainer />
        </div>
      )}

      {/* Right: Burger menu (mobile/tablet only) */}
      <div className="flex items-center gap-2">
        <BurgerMenu />
        {/* User menu can go here later */}
      </div>
    </div>
  );
}
