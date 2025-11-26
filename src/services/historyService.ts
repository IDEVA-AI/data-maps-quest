import { supabase } from '@/lib/supabase';
import { ApiResponse } from './api';
import { authService } from './authService';

export interface HistoryEntry {
  id: number;
  type: 'consulta' | 'disparo' | 'template' | 'message';
  action: string;
  description: string;
  entity_id: number;
  entity_type: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  user_id?: number;
}

export interface HistoryFilters {
  type?: string;
  action?: string;
  entity_type?: string;
  dateFrom?: string;
  dateTo?: string;
  user_id?: number;
  page?: number;
  limit?: number;
}

export interface HistoryStats {
  totalEntries: number;
  consultasCount: number;
  disparosCount: number;
  messagesCount: number;
  templatesCount: number;
}

export interface ActivitySummary {
  date: string;
  consultas: number;
  disparos: number;
  messages: number;
  templates: number;
}

class HistoryService {
  // Get history entries with filters (using consultas and resultados tables)
  async getHistory(filters?: HistoryFilters): Promise<ApiResponse<HistoryEntry[]>> {
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

      // Get consultas as history entries
      let consultasQuery = supabase
        .from('consultas')
        .select('id_consulta, nome, createdat')
        .eq('id_usuario', currentUser.id_usuario)
        .order('createdat', { ascending: false });

      if (filters?.limit) {
        consultasQuery = consultasQuery.limit(filters.limit);
      }

      const { data: consultas, error: consultasError } = await consultasQuery;

      if (consultasError) {
        return {
          success: false,
          error: consultasError.message
        };
      }

      // Convert consultas to history entries
      const consultaEntries: HistoryEntry[] = (consultas || []).map(consulta => ({
        id: consulta.id_consulta,
        type: 'consulta' as const,
        action: 'created',
        description: `Consulta criada: ${consulta.nome}`,
        entity_id: consulta.id_consulta,
        entity_type: 'consulta',
        created_at: consulta.createdat,
        user_id: currentUser.id_usuario
      }));

      // Get resultados as disparo history entries
      let resultadosQuery = supabase
        .from('resultados')
        .select(`
          id_resultado,
          id_consulta,
          nomeempresa,
          status,
          createdat,
          updated_at,
          consultas!inner(id_usuario)
        `)
        .eq('consultas.id_usuario', currentUser.id_usuario)
        .order('updated_at', { ascending: false });

      if (filters?.limit) {
        resultadosQuery = resultadosQuery.limit(filters.limit);
      }

      const { data: resultados, error: resultadosError } = await resultadosQuery;

      if (resultadosError) {
        return {
          success: false,
          error: resultadosError.message
        };
      }

      // Convert resultados to history entries
      const disparoEntries: HistoryEntry[] = (resultados || []).map(resultado => ({
        id: resultado.id_resultado,
        type: 'disparo' as const,
        action: resultado.status === 'Enviado' ? 'sent' : 'created',
        description: `${resultado.status === 'Enviado' ? 'Mensagem enviada' : 'Contato adicionado'}: ${resultado.nomeempresa}`,
        entity_id: resultado.id_resultado,
        entity_type: 'disparo',
        created_at: resultado.updated_at || resultado.createdat,
        user_id: currentUser.id_usuario,
        metadata: {
          consulta_id: resultado.id_consulta,
          status: resultado.status
        }
      }));

      // Combine and sort all entries
      const allEntries = [...consultaEntries, ...disparoEntries]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      // Apply filters
      let filteredEntries = allEntries;

      if (filters?.type) {
        filteredEntries = filteredEntries.filter(entry => entry.type === filters.type);
      }

      if (filters?.action) {
        filteredEntries = filteredEntries.filter(entry => entry.action === filters.action);
      }

      if (filters?.dateFrom) {
        filteredEntries = filteredEntries.filter(entry => 
          new Date(entry.created_at) >= new Date(filters.dateFrom!)
        );
      }

      if (filters?.dateTo) {
        filteredEntries = filteredEntries.filter(entry => 
          new Date(entry.created_at) <= new Date(filters.dateTo!)
        );
      }

      if (filters?.limit) {
        filteredEntries = filteredEntries.slice(0, filters.limit);
      }

      return {
        success: true,
        data: filteredEntries
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  // Get recent history for dashboard
  async getRecentHistory(limit: number = 10): Promise<ApiResponse<HistoryEntry[]>> {
    return this.getHistory({ limit });
  }

  // Get history statistics
  async getHistoryStats(): Promise<ApiResponse<HistoryStats>> {
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

      // Count consultas
      const { count: consultasCount, error: consultasError } = await supabase
        .from('consultas')
        .select('*', { count: 'exact', head: true })
        .eq('id_usuario', currentUser.id_usuario);

      if (consultasError) {
        return {
          success: false,
          error: consultasError.message
        };
      }

      // Count disparos (resultados)
      const { count: disparosCount, error: disparosError } = await supabase
        .from('resultados')
        .select('*, consultas!inner(id_usuario)', { count: 'exact', head: true })
        .eq('consultas.id_usuario', currentUser.id_usuario);

      if (disparosError) {
        return {
          success: false,
          error: disparosError.message
        };
      }

      // Count sent messages
      const { count: messagesCount, error: messagesError } = await supabase
        .from('resultados')
        .select('*, consultas!inner(id_usuario)', { count: 'exact', head: true })
        .eq('consultas.id_usuario', currentUser.id_usuario)
        .eq('status', 'Enviado');

      if (messagesError) {
        return {
          success: false,
          error: messagesError.message
        };
      }

      // Count templates (resultados with template)
      const { count: templatesCount, error: templatesError } = await supabase
        .from('resultados')
        .select('*, consultas!inner(id_usuario)', { count: 'exact', head: true })
        .eq('consultas.id_usuario', currentUser.id_usuario)
        .not('template', 'is', null);

      if (templatesError) {
        return {
          success: false,
          error: templatesError.message
        };
      }

      const stats: HistoryStats = {
        totalEntries: (consultasCount || 0) + (disparosCount || 0),
        consultasCount: consultasCount || 0,
        disparosCount: disparosCount || 0,
        messagesCount: messagesCount || 0,
        templatesCount: templatesCount || 0
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

  // Get activity summary by date range
  async getActivitySummary(dateFrom: string, dateTo: string): Promise<ApiResponse<ActivitySummary[]>> {
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

      // Get consultas in date range
      const { data: consultas, error: consultasError } = await supabase
        .from('consultas')
        .select('createdat')
        .eq('id_usuario', currentUser.id_usuario)
        .gte('createdat', dateFrom)
        .lte('createdat', dateTo);

      if (consultasError) {
        return {
          success: false,
          error: consultasError.message
        };
      }

      // Get resultados in date range
      const { data: resultados, error: resultadosError } = await supabase
        .from('resultados')
        .select(`
          createdat,
          updated_at,
          status,
          template,
          consultas!inner(id_usuario)
        `)
        .eq('consultas.id_usuario', currentUser.id_usuario)
        .gte('createdat', dateFrom)
        .lte('createdat', dateTo);

      if (resultadosError) {
        return {
          success: false,
          error: resultadosError.message
        };
      }

      // Group by date
      const activityMap = new Map<string, ActivitySummary>();

      // Process consultas
      (consultas || []).forEach(consulta => {
        const date = new Date(consulta.createdat).toISOString().split('T')[0];
        if (!activityMap.has(date)) {
          activityMap.set(date, {
            date,
            consultas: 0,
            disparos: 0,
            messages: 0,
            templates: 0
          });
        }
        activityMap.get(date)!.consultas++;
      });

      // Process resultados
      (resultados || []).forEach(resultado => {
        const date = new Date(resultado.createdat).toISOString().split('T')[0];
        if (!activityMap.has(date)) {
          activityMap.set(date, {
            date,
            consultas: 0,
            disparos: 0,
            messages: 0,
            templates: 0
          });
        }
        
        const summary = activityMap.get(date)!;
        summary.disparos++;
        
        if (resultado.status === 'Enviado') {
          summary.messages++;
        }
        
        if (resultado.template) {
          summary.templates++;
        }
      });

      const summaries = Array.from(activityMap.values())
        .sort((a, b) => a.date.localeCompare(b.date));

      return {
        success: true,
        data: summaries
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  // Get history for a specific entity
  async getEntityHistory(entityType: string, entityId: number): Promise<ApiResponse<HistoryEntry[]>> {
    try {
      if (entityType === 'consulta') {
        // Get consulta and its resultados
        const { data: consulta, error: consultaError } = await supabase
          .from('consultas')
          .select('*')
          .eq('id_consulta', entityId)
          .single();

        if (consultaError) {
          return {
            success: false,
            error: consultaError.message
          };
        }

        const { data: resultados, error: resultadosError } = await supabase
          .from('resultados')
          .select('*')
          .eq('id_consulta', entityId)
          .order('createdat', { ascending: false });

        if (resultadosError) {
          return {
            success: false,
            error: resultadosError.message
          };
        }

        const entries: HistoryEntry[] = [
          {
            id: consulta.id_consulta,
            type: 'consulta',
            action: 'created',
            description: `Consulta criada: ${consulta.nome}`,
            entity_id: consulta.id_consulta,
            entity_type: 'consulta',
            created_at: consulta.createdat,
            user_id: consulta.id_usuario
          },
          ...(resultados || []).map(resultado => ({
            id: resultado.id_resultado,
            type: 'disparo' as const,
            action: resultado.status === 'Enviado' ? 'sent' : 'created',
            description: `${resultado.status === 'Enviado' ? 'Mensagem enviada' : 'Contato adicionado'}: ${resultado.nomeempresa}`,
            entity_id: resultado.id_resultado,
            entity_type: 'disparo',
            created_at: resultado.updated_at || resultado.createdat,
            user_id: consulta.id_usuario,
            metadata: {
              consulta_id: resultado.id_consulta,
              status: resultado.status
            }
          }))
        ];

        return {
          success: true,
          data: entries.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        };
      }

      return {
        success: true,
        data: []
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  // Create a new history entry (for manual logging) - Not implemented for Supabase version
  async createHistoryEntry(entry: Omit<HistoryEntry, 'id' | 'created_at'>): Promise<ApiResponse<HistoryEntry>> {
    return {
      success: false,
      error: 'Funcionalidade não implementada na versão Supabase'
    };
  }

  // Get user activity history
  async getUserHistory(userId: number, filters?: HistoryFilters): Promise<ApiResponse<HistoryEntry[]>> {
    // For now, just return the current user's history
    return this.getHistory(filters);
  }

  // Cleanup old history entries - Not implemented for Supabase version
  async cleanupHistory(olderThanDays: number): Promise<ApiResponse<{ deletedCount: number }>> {
    return {
      success: false,
      error: 'Funcionalidade não implementada na versão Supabase'
    };
  }
}

export const historyService = new HistoryService();
