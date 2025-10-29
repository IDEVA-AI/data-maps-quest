import { supabase } from '@/lib/supabase';
import { ApiResponse } from './api';

export interface Resultado {
  id: number;
  id_consulta: number;
  nomeempresa: string;
  endereco: string;
  rating: number;
  telefone: string;
  website: string;
  email: string;
  active: boolean;
  createdat: string;
  lastupdate: string;
}

export interface ResultadoFilters {
  hasPhone?: boolean;
  hasEmail?: boolean;
  hasWebsite?: boolean;
  minRating?: number;
}

class ResultadoService {
  async getResultadosByConsultaId(consultaId: number, filters?: ResultadoFilters): Promise<ApiResponse<Resultado[]>> {
    try {
      let query = supabase
        .from('resultados')
        .select('*')
        .eq('id_consulta', consultaId)
        .order('rating', { ascending: false });

      // Apply filters
      if (filters?.hasPhone) {
        query = query.not('telefone', 'is', null);
      }

      if (filters?.hasEmail) {
        query = query.not('email', 'is', null);
      }

      if (filters?.hasWebsite) {
        query = query.not('website', 'is', null);
      }

      if (filters?.minRating) {
        query = query.gte('rating', filters.minRating);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar resultados:', error);
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true,
        data: data || []
      };
    } catch (error) {
      console.error('Erro ao buscar resultados:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }

  async getResultadoById(id: number): Promise<ApiResponse<Resultado>> {
    try {
      const { data, error } = await supabase
        .from('resultados')
        .select('*')
        .eq('id_resultado', id)
        .single();

      if (error) {
        console.error('Erro ao buscar resultado:', error);
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Erro ao buscar resultado:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }

  async getResultadosStats(consultaId: number): Promise<ApiResponse<{
    total: number;
    withPhone: number;
    withEmail: number;
    withWebsite: number;
    avgRating: number;
  }>> {
    try {
      const { data, error } = await supabase
        .from('resultados')
        .select('telefone, email, website, rating')
        .eq('id_consulta', consultaId);

      if (error) {
        console.error('Erro ao buscar estatísticas:', error);
        return {
          success: false,
          error: error.message
        };
      }

      const stats = {
        total: data.length,
        withPhone: data.filter(r => r.telefone).length,
        withEmail: data.filter(r => r.email).length,
        withWebsite: data.filter(r => r.website).length,
        avgRating: data.length > 0 ? data.reduce((sum, r) => sum + (r.rating || 0), 0) / data.length : 0
      };

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }
}

export const resultadoService = new ResultadoService();