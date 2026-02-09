// web/src/components/ColumnSettings.jsx (JSX, no SelectionIndicator)
import {
  Button,
  Menu,
  MenuItem,
  MenuTrigger,
  Popover,
} from "react-aria-components";
import { CircleEllipsis } from "lucide-react";

export default function ColumnSettings({ meta, config, onToggle, onReset }) {
  // include all non-Json fields so users can re-show previously hidden ones,
  // but exclude fields explicitly marked as internal (IDs, foreign keys)
  const allTableFields = meta.fields.filter(
    (f) => !["Json"].includes(f.type) && !config[f.name]?.hideFromColumnSettings,
  ); // [attached_file:1]

  const getVisibleKeys = () =>
    new Set(
      allTableFields
        .filter((f) => {
          const c = config[f.name] || {};
          return !(c.hidden || c.hideInTable);
        })
        .map((f) => f.name),
    ); // [attached_file:1]

  const handleSelectionChange = (keys) => {
    const selected =
      keys === "all" ? new Set(allTableFields.map((f) => f.name)) : keys; // [attached_file:1]
    allTableFields.forEach((f) => {
      const shouldBeVisible = selected.has(f.name);
      const c = config[f.name] || {};
      const isVisible = !(c.hidden || c.hideInTable);
      if (shouldBeVisible !== isVisible) {
        onToggle(f.name, { hideInTable: !shouldBeVisible, hidden: false });
      }
    }); // [attached_file:1]
  };

  return (
    <MenuTrigger>
      <Button className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800/50 dark:hover:bg-neutral-800">
        Columns
        <CircleEllipsis size={16} strokeWidth={1} absoluteStrokeWidth />
      </Button>
      {/* [attached_file:1] */}
      <Popover
        placement="bottom end"
        className="flex min-w-[280px] flex-col overflow-hidden rounded-xl border border-gray-200 bg-gray-50/50 shadow-xl backdrop-blur-sm dark:border-neutral-700 dark:bg-neutral-800/50"
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-3 pt-3 pb-2 dark:border-neutral-700">
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            Show or hide columns
          </span>
          <Button
            onPress={onReset}
            className="cursor-pointer px-2 py-1 text-xs text-blue-600 hover:underline focus:outline-none dark:text-blue-400"
          >
            Reset
          </Button>
        </div>{" "}
        {/* [attached_file:1] */}
        <Menu
          selectionMode="multiple"
          selectedKeys={getVisibleKeys()}
          onSelectionChange={handleSelectionChange}
          className="min-h-0 flex-1 overflow-auto p-2"
        >
          {allTableFields.map((f) => {
            const label = (config[f.name] && config[f.name].label) || f.name;
            return (
              <MenuItem
                key={f.name}
                id={f.name}
                textValue={label}
                className="flex cursor-pointer items-center gap-2 rounded px-3 py-2 text-sm text-gray-700 outline-none data-[focused]:bg-gray-300/50 dark:text-gray-500 dark:data-[focused]:bg-neutral-600/25"
              >
                {({ isSelected }) => (
                  <>
                    <div className="flex h-4 w-4 items-center justify-center rounded border border-gray-300 bg-white dark:border-neutral-600 dark:bg-neutral-900">
                      {isSelected && (
                        <svg
                          className="h-3 w-3 text-blue-600"
                          viewBox="0 0 12 12"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M10 3L4.5 8.5L2 6"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                    <span>{label}</span>
                  </>
                )}
              </MenuItem>
            );
          })}
        </Menu>{" "}
        {/* [attached_file:1] */}
      </Popover>
    </MenuTrigger>
  );
}
