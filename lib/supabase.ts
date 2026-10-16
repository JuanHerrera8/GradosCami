import { createClient, SupabaseClient } from '@supabase/supabase-js'

let clienteSupabaseInstancia: SupabaseClient | null = null

function esValorValido(valor: string | undefined): valor is string {
  return Boolean(valor) && !valor!.includes('tu-proyecto') && !valor!.startsWith('tu-')
}

/**
 * Obtiene o inicializa el cliente de Supabase.
 * En el servidor usa la llave de servicio (SUPABASE_SERVICE_ROLE_KEY) si está configurada,
 * lo que permite activar RLS y bloquear escrituras directas desde el navegador.
 * Si las variables de entorno aún no han sido configuradas, retorna null de forma segura.
 */
export function obtenerClienteSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const serviceKey =
    typeof window === 'undefined' ? process.env.SUPABASE_SERVICE_ROLE_KEY : undefined

  if (!esValorValido(url) || !esValorValido(anonKey)) {
    return null
  }

  if (!clienteSupabaseInstancia) {
    clienteSupabaseInstancia = createClient(url, esValorValido(serviceKey) ? serviceKey : anonKey, {
      auth: {
        persistSession: false,
      },
    })
  }

  return clienteSupabaseInstancia
}
