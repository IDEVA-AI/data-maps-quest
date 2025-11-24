import { supabase } from '@/lib/supabase';
import { ApiResponse } from './api';
import { authService } from './authService';
import { tokenService } from './tokenService';

export interface Consulta {
  id: number;
  id_usuario: number;
  date: string;
  category: string;
  location: string;
  resultsCount: number;
  tokensUsed: number;
  status: string;
  description: string;
  created_at?: string;
  updated_at?: string;
  // Campos do usuário (apenas para admin/analista)
  usuario_nome?: string;
  usuario_email?: string;
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
  // Get all consultas with optional filters (with role-based access control)
  async getConsultas(filters?: ConsultaFilters): Promise<ApiResponse<Consulta[]>> {
    try {
      // Validate session first
      const sessionValidation = await authService.validateSession();
      if (!sessionValidation.success || !sessionValidation.data) {
        return {
          success: false,
          error: 'Usuário não autenticado'
        };
      }

      const currentUser = sessionValidation.data;
      const canViewAllUsers = authService.canViewAllUsers();
      const canViewUserNames = authService.canViewUserNames();

      // Build query based on user role
      let consultasQuery;
      
      if (canViewUserNames) {
        consultasQuery = supabase
          .from('consultas')
          .select(`
            id_consulta,
            id_usuario,
            parametrocategoria,
            parametrolocalidade,
            custotokens,
            createdat,
            lastupdate,
            active,
            usuarios!inner(nome, email)
          `);
      } else {
        consultasQuery = supabase
          .from('consultas')
          .select(`
            id_consulta,
            id_usuario,
            parametrocategoria,
            parametrolocalidade,
            custotokens,
            createdat,
            lastupdate,
            active
          `);
      }

      // Apply role-based filtering
      if (!canViewAllUsers) {
        // Clientes só veem suas próprias consultas
        consultasQuery = consultasQuery.eq('id_usuario', currentUser.id_usuario);
      }

      consultasQuery = consultasQuery.order('createdat', { ascending: false });

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

          const result: Consulta = {
            id: consulta.id_consulta,
            id_usuario: consulta.id_usuario,
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

          // Add user info only if user has permission
          if (canViewUserNames && consulta.usuarios) {
            result.usuario_nome = consulta.usuarios.nome;
            result.usuario_email = consulta.usuarios.email;
          }

          return result;
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

  // Get a specific consulta by ID (with role-based access control)
  async getConsultaById(id: number): Promise<ApiResponse<Consulta>> {
    try {
      // Validate session first
      const sessionValidation = await authService.validateSession();
      if (!sessionValidation.success || !sessionValidation.data) {
        return {
          success: false,
          error: 'Usuário não autenticado'
        };
      }

      const currentUser = sessionValidation.data;
      const canViewAllUsers = authService.canViewAllUsers();
      const canViewUserNames = authService.canViewUserNames();

      // Build query based on user role
      let consultaQuery;
      
      if (canViewUserNames) {
        consultaQuery = supabase
          .from('consultas')
          .select(`
            id_consulta,
            id_usuario,
            parametrocategoria,
            parametrolocalidade,
            custotokens,
            createdat,
            lastupdate,
            active,
            usuarios!inner(nome, email)
          `)
          .eq('id_consulta', id);
      } else {
        consultaQuery = supabase
          .from('consultas')
          .select(`
            id_consulta,
            id_usuario,
            parametrocategoria,
            parametrolocalidade,
            custotokens,
            createdat,
            lastupdate,
            active
          `)
          .eq('id_consulta', id);
      }

      // Apply role-based filtering
      if (!canViewAllUsers) {
        consultaQuery = consultaQuery.eq('id_usuario', currentUser.id_usuario);
      }

      const { data, error } = await consultaQuery.single();

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
      const transformedData: Consulta = {
        id: data.id_consulta,
        id_usuario: data.id_usuario,
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

      // Add user info only if user has permission
      if (canViewUserNames && data.usuarios) {
        transformedData.usuario_nome = data.usuarios.nome;
        transformedData.usuario_email = data.usuarios.email;
      }

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

  // Get consulta stats (only for authenticated user)
  async getConsultaStats(): Promise<ApiResponse<ConsultaStats>> {
    try {
      // Validate session first
      const sessionValidation = await authService.validateSession();
      if (!sessionValidation.success || !sessionValidation.data) {
        return {
          success: false,
          error: 'Usuário não autenticado'
        };
      }

      const currentUser = sessionValidation.data;

      // Get stats for the authenticated user only
      const { data: consultasData } = await supabase
        .from('consultas')
        .select('id_consulta, custotokens, createdat')
        .eq('id_usuario', currentUser.id_usuario);

      const { data: resultadosData } = await supabase
        .from('resultados')
        .select('id_consulta')
        .in('id_consulta', (consultasData || []).map(c => c.id_consulta));

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

  // Get recent consultas for dashboard (only for authenticated user)
  async getRecentConsultas(limit: number = 5): Promise<ApiResponse<Consulta[]>> {
    try {
      // Validate session first
      const sessionValidation = await authService.validateSession();
      if (!sessionValidation.success || !sessionValidation.data) {
        return {
          success: false,
          error: 'Usuário não autenticado'
        };
      }

      const currentUser = sessionValidation.data;

      const { data, error } = await supabase
        .from('consultas')
        .select(`
          id_consulta,
          id_usuario,
          parametrocategoria,
          parametrolocalidade,
          custotokens,
          createdat,
          lastupdate,
          active
        `)
        .eq('id_usuario', currentUser.id_usuario)
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
            id_usuario: consulta.id_usuario,
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

  // Create a new consulta (with authenticated user)
  async createConsulta(newConsulta: Omit<Consulta, 'id' | 'id_usuario' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Consulta>> {
    try {
      // Validate session first
      const sessionValidation = await authService.validateSession();
      if (!sessionValidation.success || !sessionValidation.data) {
        return {
          success: false,
          error: 'Usuário não autenticado'
        };
      }

      const currentUser = sessionValidation.data;
      const nowIso = new Date().toISOString();
      const cost = 15;

      const bal = await tokenService.getBalance(currentUser.id_usuario)
      if (!bal.success || !bal.data || bal.data.tokens < cost) {
        return { success: false, error: 'Saldo insuficiente' };
      }

      const deb = await tokenService.debitViaSupabase({ userId: currentUser.id_usuario, tokens: cost, source: 'consulta' })
      if (!deb.success) {
        return { success: false, error: deb.error || 'Falha ao debitar tokens' };
      }
      
      const { data, error } = await supabase
        .from('consultas')
        .insert({
          id_usuario: currentUser.id_usuario,
          parametrocategoria: newConsulta.category,
          parametrolocalidade: newConsulta.location,
          custotokens: cost,
          createdat: nowIso,
          lastupdate: nowIso,
          active: true
        })
        .select(`
          id_consulta,
          id_usuario,
          parametrocategoria,
          parametrolocalidade,
          custotokens,
          createdat,
          lastupdate,
          active
        `)
        .single();

      if (error) {
        await tokenService.creditViaSupabase({ userId: currentUser.id_usuario, tokens: cost, source: 'consulta_rollback' })
        return { success: false, error: error.message };
      }

      const transformed: Consulta = {
        id: data.id_consulta,
        id_usuario: data.id_usuario,
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
