import { formatDate } from "@/lib/format";

export function UpdatedOn({ iso }: { iso: string }) {
  const date = iso.slice(0, 10);
  return (
    <p className="mt-3 text-sm text-gray-500">
      Actualizado el <time dateTime={date}>{formatDate(date)}</time>
    </p>
  );
}
