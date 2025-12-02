export function Button({ children, ...props }) {
  return (
    <button
      className="border rounded px-3 py-1 bg-blue-600 text-white hover:bg-blue-700"
      {...props}
    >
      {children}
    </button>
  );
}
