import { MessageSquarePlus } from "lucide-react";

export function StickyLeadCTA() {
  return (
    <div id="lead-sticky" className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white p-4 lg:hidden">
      <a href="#quiero-que-me-contacten" className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-4 text-sm font-bold text-white shadow-lg shadow-indigo-500/20">
        <MessageSquarePlus className="size-5" aria-hidden="true" />
        Quiero que me contacten
      </a>
    </div>
  );
}
