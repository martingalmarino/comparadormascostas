import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <h1 className="text-3xl font-bold text-gray-900">No encontramos esa página</h1>
      <p className="mt-3 text-gray-600">El plan o la guía no están en el comparador.</p>
      <Link href="/comparar" className="mt-6 inline-flex rounded-xl bg-indigo-600 px-4 py-3 font-bold text-white hover:bg-indigo-700">
        Ir al comparador
      </Link>
    </div>
  );
}
