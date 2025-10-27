import { supabase } from '@/lib/supabase';
import { ApiResponse } from './api';

export interface Consulta {
  id: number;
  date: string;
  category: string;
  location: string;
  resultsCount: number;
  tokensUsed: number;
  status: string;
  description: string;
  created_at?: string;
  updated_at?: string;
}

export interface ConsultaFilters {
  category?: string;
  search?: string;
}

export interface ConsultaStats {
  totalConsultas: number;
  totalTokensUsados: number;
  totalResultados: number;
  consultasHoje: number;
}

class ConsultaService {
  // Get all consultas with optional filters
  async getConsultas(filters?: ConsultaFilters): Promise<ApiResponse<Consulta[]>> {
    try {
      // First get consultas
      let consultasQuery = supabase
        .from('consultas')
        .select(`
          id_consulta,
          parametrocategoria,
          parametrolocalidade,
          custotokens,
          createdat,
          lastupdate,
          active
        `)
        .order('createdat', { ascending: false });

      if (filters?.category) {
        consultasQuery = consultasQuery.eq('parametrocategoria', filters.category);
      }
      if (filters?.search) {
        consultasQuery = consultasQuery.or(`parametrocategoria.ilike.%${filters.search}%,parametrolocalidade.ilike.%${filters.search}%`);
      }

      const { data: consultasData, error: consultasError } = await consultasQuery;

      if (consultasError) {
        return {
          success: false,
          error: consultasError.message
        };
      }

      // Get results count for each consulta
      const consultasWithResults = await Promise.all(
        (consultasData || []).map(async (consulta) => {
          const { count } = await supabase
            .from('resultados')
            .select('*', { count: 'exact', head: true })
            .eq('id_consulta', consulta.id_consulta);

          return {
            id: consulta.id_consulta,
            date: consulta.createdat,
            category: consulta.parametrocategoria,
            location: consulta.parametrolocalidade,
            resultsCount: count || 0,
            tokensUsed: consulta.custotokens,
            status: consulta.active ? 'Ativa' : 'Inativa',
            description: `${consulta.parametrocategoria} em ${consulta.parametrolocalidade}`,
            created_at: consulta.createdat,
            updated_at: consulta.lastupdate
          };
        })
      );

      return {
        success: true,
        data: consultasWithResults
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  // Get a specific consulta by ID
  async getConsultaById(id: number): Promise<ApiResponse<Consulta>> {
    try {
      const { data, error } = await supabase
        .from('consultas')
        .select(`
          id_consulta,
          parametrocategoria,
          parametrolocalidade,
          custotokens,
          createdat,
          lastupdate,
          active
        `)
        .eq('id_consulta', id)
        .single();

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      // Get results count for this consulta
      const { count } = await supabase
        .from('resultados')
        .select('*', { count: 'exact', head: true })
        .eq('id_consulta', data.id_consulta);

      // Transform data to match Consulta interface
      const transformedData = {
        id: data.id_consulta,
        date: data.createdat,
        category: data.parametrocategoria,
        location: data.parametrolocalidade,
        resultsCount: count || 0,
        tokensUsed: data.custotokens,
        status: data.active ? 'Ativa' : 'Inativa',
        description: `${data.parametrocategoria} em ${data.parametrolocalidade}`,
        created_at: data.createdat,
        updated_at: data.lastupdate
      };

      return {
        success: true,
        data: transformedData
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  // Get consulta stats
  async getConsultaStats(): Promise<ApiResponse<ConsultaStats>> {
    try {
      // Basic stats implementation (should be replaced with optimized SQL)
      const { data: consultasData } = await supabase
        .from('consultas')
        .select('custotokens, createdat');

      const { data: resultadosData } = await supabase
        .from('resultados')
        .select('id_consulta');

      const totalConsultas = consultasData?.length || 0;
      const totalTokensUsados = consultasData?.reduce((sum, c) => sum + (c.custotokens || 0), 0) || 0;
      const totalResultados = resultadosData?.length || 0;

      // Consultas hoje
      const today = new Date().toDateString();
      const consultasHoje = (consultasData || []).filter(c => new Date(c.createdat).toDateString() === today).length;

      return {
        success: true,
        data: { totalConsultas, totalTokensUsados, totalResultados, consultasHoje }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  // Delete a consulta (simplified implementation)
  async deleteConsulta(id: number): Promise<ApiResponse<void>> {
    return {
      success: false,
      error: 'Funcionalidade não implementada ainda'
    };
  }

  // Get recent consultas for dashboard
  async getRecentConsultas(limit: number = 5): Promise<ApiResponse<Consulta[]>> {
    try {
      const { data, error } = await supabase
        .from('consultas')
        .select(`
          id_consulta,
          parametrocategoria,
          parametrolocalidade,
          custotokens,
          createdat,
          lastupdate,
          active
        `)
        .order('createdat', { ascending: false })
        .limit(limit);

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      // Get results count for each consulta
      const consultasWithResults = await Promise.all(
        (data || []).map(async (consulta) => {
          const { count } = await supabase
            .from('resultados')
            .select('*', { count: 'exact', head: true })
            .eq('id_consulta', consulta.id_consulta);

          return {
            id: consulta.id_consulta,
            date: consulta.createdat,
            category: consulta.parametrocategoria,
            location: consulta.parametrolocalidade,
            resultsCount: count || 0,
            tokensUsed: consulta.custotokens,
            status: consulta.active ? 'Ativa' : 'Inativa',
            description: `${consulta.parametrocategoria} em ${consulta.parametrolocalidade}`,
            created_at: consulta.createdat,
            updated_at: consulta.lastupdate
          };
        })
      );

      return {
        success: true,
        data: consultasWithResults
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  // Create a new consulta
  async createConsulta(newConsulta: Omit<Consulta, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Consulta>> {
    try {
      const nowIso = new Date().toISOString();
      const { data, error } = await supabase
        .from('consultas')
        .insert({
          parametrocategoria: newConsulta.category,
          parametrolocalidade: newConsulta.location,
          custotokens: newConsulta.tokensUsed,
          createdat: nowIso,
          lastupdate: nowIso,
          active: true
        })
        .select(`
          id_consulta,
          parametrocategoria,
          parametrolocalidade,
          custotokens,
          createdat,
          lastupdate,
          active
        `)
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      const transformed: Consulta = {
        id: data.id_consulta,
        date: data.createdat,
        category: data.parametrocategoria,
        location: data.parametrolocalidade,
        resultsCount: 0,
        tokensUsed: data.custotokens,
        status: data.active ? 'Ativa' : 'Inativa',
        description: `${data.parametrocategoria} em ${data.parametrolocalidade}`,
        created_at: data.createdat,
        updated_at: data.lastupdate
      };

      return { success: true, data: transformed };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }
}

export const consultaService = new ConsultaService();