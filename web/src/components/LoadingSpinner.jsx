export default function LoadingSpinner({ label = "Loading..." }) {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="w-48 text-center">
        <div className="mb-3 text-gray-500">{label}</div>
        <div className="h-1.5 rounded-full bg-gray-200 dark:bg-neutral-700 overflow-hidden">
          <div className="h-full w-1/3 rounded-full bg-blue-600 animate-[indeterminate_1.5s_ease-in-out_infinite]" />
        </div>
      </div>
    </div>
  );
}
