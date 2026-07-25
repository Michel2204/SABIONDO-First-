import FileteEsquina from "./FileteEsquina";

export default function ConsolaJuego({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-[460px] min-h-[720px] bg-gradient-to-b from-omnibus to-[#0b4437] rounded-[28px] border-[3px] border-dorado shadow-console relative overflow-hidden flex flex-col bg-grain">
      <div className="bg-tinta text-dorado-claro font-heading text-[11px] tracking-[3px] text-center py-1.5 border-b-2 border-dorado relative z-30">
        ◄ LÍNEA ESPECIAL — DESTINO: SABIDURÍA ►
      </div>

      <FileteEsquina posicion="tl" />
      <FileteEsquina posicion="tr" />
      <FileteEsquina posicion="bl" />
      <FileteEsquina posicion="br" />

      <div className="flex flex-col flex-1 px-6 pt-6 pb-6 relative z-10">{children}</div>
    </div>
  );
}
