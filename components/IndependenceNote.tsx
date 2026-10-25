export function IndependenceNote({ className = "" }: { className?: string }) {
  return (
    <p className={`text-sm leading-relaxed text-gray-600 ${className}`}>
      Somos un comparador independiente. Te derivamos a la marca: no vendemos seguros ni intermediamos en la contratación.
    </p>
  );
}
