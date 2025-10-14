// web/src/components/ColumnSettings.jsx (JSX, no SelectionIndicator)
import {
  Button,
  Menu,
  MenuItem,
  MenuTrigger,
  Popover,
} from "react-aria-components";

export default function ColumnSettings({ meta, config, onToggle, onReset }) {
  // include all non-Json fields so users can re-show previously hidden ones
  const allTableFields = meta.fields.filter((f) => !["Json"].includes(f.type)); // [attached_file:1]

  const getVisibleKeys = () =>
    new Set(
      allTableFields
        .filter((f) => {
          const c = config[f.name] || {};
          return !(c.hidden || c.hideInTable);
        })
        .map((f) => f.name)
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
      <Button className="py-2 px-4 inline-flex items-center gap-2 text-sm font-medium rounded-lg border border-gray-200 bg-white shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-neutral-900 dark:border-neutral-700 dark:hover:bg-neutral-800">
        ⚙️ Columns
      </Button>{" "}
      {/* [attached_file:1] */}
      <Popover
        placement="bottom end"
        className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl border border-gray-200 dark:border-neutral-700 min-w-[280px]"
      >
        <div className="px-3 pt-3 pb-2 flex items-center justify-between border-b border-gray-200 dark:border-neutral-700">
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            Show/Hide Columns
          </span>
          <Button
            onPress={onReset}
            className="text-xs text-blue-600 hover:underline dark:text-blue-400 px-2 py-1 rounded"
          >
            Reset
          </Button>
        </div>{" "}
        {/* [attached_file:1] */}
        <Menu
          selectionMode="multiple"
          selectedKeys={getVisibleKeys()}
          onSelectionChange={handleSelectionChange}
          className="max-h-[400px] overflow-auto p-2"
        >
          {allTableFields.map((f) => {
            const label = (config[f.name] && config[f.name].label) || f.name;
            return (
              <MenuItem
                key={f.name}
                id={f.name}
                textValue={label}
                className="px-3 py-2 rounded cursor-pointer outline-none text-sm text-gray-700 dark:text-gray-300
                           data-[focused]:bg-gray-100 dark:data-[focused]:bg-neutral-700 flex items-center gap-2"
              >
                {({ isSelected }) => (
                  <>
                    <div className="w-4 h-4 border border-gray-300 dark:border-neutral-600 rounded flex items-center justify-center bg-white dark:bg-neutral-900">
                      {isSelected && (
                        <svg
                          className="w-3 h-3 text-blue-600"
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
