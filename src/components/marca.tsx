/** Marca de la aplicación: una casilla con la marca azul sobresaliendo, como tachada a mano. */
export function Marca({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect
        x="3.5"
        y="8.5"
        width="20"
        height="20"
        className="fill-none stroke-tinta"
        strokeWidth="2.5"
      />
      <path
        d="M8 17.5 14 23.5 28 5.5"
        className="fill-none stroke-tinta-azul"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
