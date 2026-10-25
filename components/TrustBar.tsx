import { CircleCheck, Info, Link2, ShieldCheck } from "lucide-react";

const items = [
  { icon: CircleCheck, label: "Precios verificados", className: "text-emerald-600" },
  { icon: Link2, label: "Fuentes citadas", className: "text-blue-600" },
  { icon: ShieldCheck, label: "Independiente", className: "text-indigo-600" },
  { icon: Info, label: "No vendemos seguros", className: "text-amber-600" },
];

export function TrustBar() {
  return (
    <ul className="grid grid-cols-2 gap-6 border-t border-gray-100 pt-8 md:grid-cols-4">
      {items.map((item) => (
        <li key={item.label} className="flex flex-col items-center gap-2 text-center">
          <item.icon className={`size-6 ${item.className}`} aria-hidden="true" />
          <span className="text-sm font-semibold text-gray-600">{item.label}</span>
        </li>
      ))}
    </ul>
  );
}
