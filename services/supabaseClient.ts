
import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabase: SupabaseClient | null = null;

export const initSupabase = (url: string, key: string) => {
  if (url && key) {
    try {
      // Basic URL validation
      new URL(url);
      supabase = createClient(url, key);
      return supabase;
    } catch (e) {
      console.error("Erro ao inicializar Supabase (URL inválida?):", e);
      return null;
    }
  }
  return null;
};

export const getSupabase = () => supabase;

export const checkConnection = async (): Promise<{ success: boolean; message?: string }> => {
  if (!supabase) return { success: false, message: 'Cliente Supabase não inicializado.' };

  try {
    // Tenta um select simples para verificar acesso
    // Usamos limit(0) para ser rápido e apenas checar permissão/conexão
    const { error } = await supabase.from('site_settings').select('id').limit(1);

    if (error) {
       console.error("Erro Check Connection:", error);
       // Tratamento de Erro Detalhado
       let errorMessage = error.message;
       
       if (typeof error === 'object' && error !== null) {
           errorMessage = error.message || JSON.stringify(error);
       }

       if (error.code === 'PGRST301' || errorMessage.includes('permission')) {
          return { success: false, message: 'Erro de Permissão (RLS). Execute o script SQL no Supabase.' };
       }
       if (errorMessage.includes('FetchError') || errorMessage.includes('Network request failed')) {
          return { success: false, message: 'Erro de Conexão. Verifique a URL.' };
       }
       if (errorMessage.includes('apikey') || error.code === '401') {
          return { success: false, message: 'Chave Anon Key inválida ou expirada.' };
       }
       
       return { success: false, message: `Erro: ${errorMessage}` };
    }
    
    return { success: true };
  } catch (e: any) {
    const msg = e.message || String(e);
    return { success: false, message: `Exceção: ${msg}` };
  }
};
