interface FileteEsquinaProps {
  posicion: "tl" | "tr" | "bl" | "br";
}

const transforms: Record<FileteEsquinaProps["posicion"], string> = {
  tl: "",
  tr: "scale(-1, 1)",
  bl: "scale(1, -1)",
  br: "scale(-1, -1)",
};

const positions: Record<FileteEsquinaProps["posicion"], string> = {
  tl: "top-0 left-0",
  tr: "top-0 right-0",
  bl: "bottom-0 left-0",
  br: "bottom-0 right-0",
};

export default function FileteEsquina({ posicion }: FileteEsquinaProps) {
  return (
    <svg
      className={`absolute ${positions[posicion]} w-20 h-20 md:w-24 md:h-24 pointer-events-none z-20 opacity-90`}
      viewBox="0 0 100 100"
      style={{ transform: transforms[posicion] }}
    >
      <path
        d="M2,2 C 22,8 14,28 32,24 C 48,20 42,44 62,38 C 74,34 70,50 84,46"
        fill="none"
        stroke="#f0c664"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M2,2 C 22,8 14,28 32,24"
        fill="none"
        stroke="#b5342a"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.7"
      />
      <circle cx="2" cy="2" r="3.5" fill="#b5342a" />
      <circle cx="32" cy="24" r="2.5" fill="#b5342a" />
      <circle cx="62" cy="38" r="2" fill="#f0c664" />
      <path
        d="M10,4 Q16,0 22,5"
        fill="none"
        stroke="#f0c664"
        strokeWidth="1.2"
        opacity="0.8"
      />
    </svg>
  );
}
