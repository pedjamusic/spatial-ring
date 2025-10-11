import { useState } from "react";
import { Button } from "react-aria-components";

export default function ColumnSettings({ meta, config, onToggle, onReset }) {
  const [isOpen, setIsOpen] = useState(false);

  const visibleFields = meta.fields.filter(
    (f) =>
      !["Json"].includes(f.type) &&
      (f.kind !== "object" || config[f.name]?.path)
  );

  return (
    <div className="relative">
      <Button
        onPress={() => setIsOpen(!isOpen)}
        className="py-2 px-4 inline-flex items-center gap-2 text-sm font-medium rounded-lg border border-gray-200 bg-white shadow-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50 dark:bg-neutral-900 dark:border-neutral-700 dark:hover:bg-neutral-800"
      >
        ⚙️ Column Settings
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown panel */}
          <div className="absolute right-0 z-50 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 dark:bg-neutral-800 dark:border-neutral-700">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Show/Hide Columns
                </h3>
                <Button
                  onPress={onReset}
                  className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400"
                >
                  Reset
                </Button>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {visibleFields.map((field) => {
                  const fieldConfig = config[field.name] || {};
                  const isHidden =
                    fieldConfig.hidden || fieldConfig.hideInTable;
                  const label = fieldConfig.label || field.name;

                  return (
                    <label
                      key={field.name}
                      className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-neutral-700 p-2 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={!isHidden}
                        onChange={(e) => {
                          const show = e.target.checked;
                          onToggle(field.name, {
                            hideInTable: !show,
                          });
                        }}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
