interface SkeletonRowProps {
  cols?: number;
}

export default function SkeletonRow({ cols = 6 }: SkeletonRowProps) {
  return (
    <tr className="border-b animate-pulse">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-gray-200 rounded w-full" />
        </td>
      ))}
    </tr>
  );
}