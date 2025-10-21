import {
  ComboBox,
  Input,
  Label,
  ListBox,
  ListBoxItem,
  ListBoxSection,
  Popover,
  Button,
} from "react-aria-components";
import { SearchField } from "react-aria-components";
import { X } from "lucide-react";

export type SearchResult = {
  id: string;
  label: string;
  model: "Asset" | "Category" | "Warehouse";
  href: string;
};

type GroupedResults = Record<string, SearchResult[]>;

type Props = {
  query: string;
  onQueryChange: (v: string) => void;
  onSubmit: (v: string) => void;
  grouped: GroupedResults; // e.g. { Asset: [...], Category: [...], Warehouse: [...] }
};

export function GlobalSearch({
  query,
  onQueryChange,
  onSubmit,
  grouped,
}: Props) {
  const hasResults = Object.values(grouped).some((arr) => arr.length > 0);

  return (
    <div className="max-w-3xl">
      {/* SearchField (accessible input with clear) */}
      <SearchField
        aria-label="Global search"
        value={query}
        onChange={onQueryChange}
        onSubmit={onSubmit}
        className="w-full"
      >
        <div className="relative">
          <Input
            className="w-full rounded-lg border bg-white py-2 ps-10 pe-8 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
            placeholder="Search assets, categories, warehouses…"
          />
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center ps-3 text-gray-400">
            <svg
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden
            >
              <path
                fillRule="evenodd"
                d="M12.9 14.32a8 8 0 111.414-1.414l4.387 4.387-1.414 1.414-4.387-4.387zM14 8a6 6 0 11-12 0 6 6 0 0112 0z"
                clipRule="evenodd"
              />
            </svg>
          </span>
          {/* Clear button when non-empty */}
          <Button
            className="absolute inset-y-0 right-0 my-auto me-2 size-6 rounded-full bg-gray-400 text-white hover:bg-gray-500 focus:outline-none"
            aria-label="Clear search"
          >
            <X size={14} />
          </Button>
        </div>
      </SearchField>

      {/* ComboBox used as a results popover to mirror Preline dropdown behavior */}
      <ComboBox
        aria-label="Global search results"
        inputValue={query}
        onInputChange={onQueryChange}
        menuTrigger="focus" // open popover on focus/typing
        allowsEmptyCollection
        className="relative mt-3"
      >
        {/* Hidden label to satisfy a11y if you don’t want a visible one */}
        <Label className="sr-only">Results</Label>

        {/* Use Input only to satisfy structure; visibility handled by SearchField above */}
        <Input className="hidden" />

        <Popover
          className={[
            "z-50 mt-1 w-full",
            "overflow-hidden rounded-xl border bg-white shadow-lg",
          ].join(" ")}
        >
          <ListBox
            renderEmptyState={() => (
              <div className="p-3 text-sm text-gray-500">
                {query ? "No results" : "Start typing to search"}
              </div>
            )}
          >
            {Object.entries(grouped).map(([groupName, items]) =>
              items.length ? (
                <ListBoxSection
                  key={groupName}
                  className="py-1"
                  aria-label={groupName}
                >
                  <div className="px-3 py-1 text-xs font-medium text-gray-500">
                    {groupName}
                  </div>
                  {items.map((item) => (
                    <ListBoxItem
                      key={item.id}
                      href={item.href}
                      className={({ isFocused }) =>
                        [
                          "flex cursor-pointer items-center gap-3 px-3 py-2",
                          isFocused ? "bg-gray-100" : "bg-transparent",
                        ].join(" ")
                      }
                    >
                      {/* Left: record label; Right: model name */}
                      <span className="text-sm text-gray-900">
                        {item.label}
                      </span>
                      <span className="ms-auto text-xs text-gray-500">
                        {item.model}
                      </span>
                    </ListBoxItem>
                  ))}
                </ListBoxSection>
              ) : null,
            )}
          </ListBox>
        </Popover>
      </ComboBox>
    </div>
  );
}
