interface EmptyStateProps {
  title?: string;
  subtitle?: string;
  icon?: string;
}

export default function EmptyState({
  title = "Belum ada data",
  subtitle = "Data akan muncul di sini setelah ditambahkan.",
  icon = "📭",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <span className="text-5xl mb-4">{icon}</span>
      <h2 className="text-xl font-semibold text-gray-700 mb-2">{title}</h2>
      <p className="text-gray-400 text-sm max-w-xs">{subtitle}</p>
    </div>
  );
}