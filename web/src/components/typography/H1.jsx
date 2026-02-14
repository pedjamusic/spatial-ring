export function H1({ children, className = "" }) {
  return (
    <h1 className={`truncate text-2xl font-black text-gray-900 lg:text-4xl dark:text-gray-100 ${className}`}>
      {children}
    </h1>
  );
}
