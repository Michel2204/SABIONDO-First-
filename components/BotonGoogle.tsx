"use client";

import { useAuth } from "@/lib/useAuth";

export default function BotonGoogle() {
  const { usuario, cargado, logueado, iniciarSesionConGoogle, cerrarSesion } = useAuth();

  // Mientras no sabemos si hay sesión, no mostramos nada para evitar parpadeo
  if (!cargado) return null;

  if (logueado && usuario) {
    const nombre =
      (usuario.user_metadata?.full_name as string | undefined) ?? usuario.email ?? "vos";

    return (
      <div className="flex items-center gap-2">
        <span className="font-body text-crema/80 text-xs truncate max-w-[110px]">{nombre}</span>
        <button
          onClick={cerrarSesion}
          className="border border-dorado/60 text-dorado-claro font-heading text-[10px] tracking-wide rounded-lg px-2 py-1"
        >
          SALIR
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={iniciarSesionConGoogle}
      className="border-2 border-dorado text-dorado-claro font-heading text-[11px] tracking-wide rounded-lg px-3 py-1.5"
    >
      INICIAR SESIÓN CON GOOGLE
    </button>
  );
}
