export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <svg
        className="w-20 h-20 text-gray-300 mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1}
          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
        />
      </svg>
      <h2 className="text-xl font-semibold text-gray-700 mb-2">
        Belum ada produk
      </h2>
      <p className="text-gray-400 text-sm">
        Produk akan muncul di sini setelah ditambahkan oleh toko.
      </p>
    </div>
  );
}