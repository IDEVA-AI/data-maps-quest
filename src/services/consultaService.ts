import { supabase } from '../lib/supabase';
import { ApiResponse } from './api';

export interface Consulta {
  id: number;
  date: string;
  category: string;
  location: string;
  resultsCount: number;
  tokensUsed: number;
  status: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ConsultaFilters {
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ConsultaStats {
  totalConsultas: number;
  totalResultados: number;
  totalTokensUsados: number;
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
;

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

  // Get consulta statistics
  async getConsultaStats(): Promise<ApiResponse<ConsultaStats>> {
    try {
      // Get consultas data
      const { data: consultasData, error: consultasError } = await supabase
        .from('consultas')
        .select('id_consulta, custotokens, createdat');

      if (consultasError) {
        return {
          success: false,
          error: consultasError.message
        };
      }

      // Get resultados count
      const { count: totalResultados, error: resultadosError } = await supabase
        .from('resultados')
        .select('*', { count: 'exact', head: true });

      if (resultadosError) {
        return {
          success: false,
          error: resultadosError.message
        };
      }

      const today = new Date().toISOString().split('T')[0];
      
      const stats: ConsultaStats = {
        totalConsultas: consultasData?.length || 0,
        totalResultados: totalResultados || 0,
        totalTokensUsados: consultasData?.reduce((sum, item) => sum + (item.custotokens || 0), 0) || 0,
        consultasHoje: consultasData?.filter(item => {
          return item.createdat?.startsWith(today);
        }).length || 0
      };

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  // Create a new consulta (simplified implementation)
  async createConsulta(consulta: Omit<Consulta, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Consulta>> {
    return {
      success: false,
      error: 'Funcionalidade não implementada ainda'
    };
  }

  // Update a consulta (simplified implementation)
  async updateConsulta(id: number, consulta: Partial<Consulta>): Promise<ApiResponse<Consulta>> {
    return {
      success: false,
      error: 'Funcionalidade não implementada ainda'
    };
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
}

export const consultaService = new ConsultaService();