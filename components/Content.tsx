export function Content({ children, wide = false }: { children: React.ReactNode; wide?: boolean }) {
  return <div className={`mx-auto px-4 py-10 sm:px-6 ${wide ? "max-w-7xl" : "max-w-3xl"}`}>{children}</div>;
}
