import { supabase } from "./supabaseClient";
import type { User } from "@supabase/supabase-js";

export function nombreDesdeUsuario(usuario: User | null): string {
  if (!usuario) return "Jugador";
  return (usuario.user_metadata?.full_name as string | undefined) ?? usuario.email ?? "Jugador";
}

export async function asegurarNombreGuardado(usuario: User) {
  const nombre = nombreDesdeUsuario(usuario);
  const { data, error: errorLectura } = await supabase
    .from("usuarios")
    .select("nombre")
    .eq("id", usuario.id)
    .maybeSingle<{ nombre: string | null }>();

  if (errorLectura) {
    console.error("Error leyendo nombre de usuario:", errorLectura);
    return;
  }

  if (data?.nombre === nombre) return;

  const { error: errorUpsert } = await supabase
    .from("usuarios")
    .upsert({ id: usuario.id, nombre }, { onConflict: "id" });

  if (errorUpsert) console.error("Error guardando nombre de usuario:", errorUpsert);
}

export async function obtenerNombres(usuarioIds: string[]): Promise<Record<string, string>> {
  const idsUnicos = Array.from(new Set(usuarioIds.filter(Boolean)));
  if (idsUnicos.length === 0) return {};

  const { data, error } = await supabase
    .from("usuarios")
    .select("id, nombre")
    .in("id", idsUnicos);

  if (error) {
    console.error("Error obteniendo nombres de usuarios:", error);
    return {};
  }

  const mapa: Record<string, string> = {};
  for (const fila of data ?? []) {
    mapa[fila.id] = fila.nombre ?? "Jugador";
  }
  return mapa;
}