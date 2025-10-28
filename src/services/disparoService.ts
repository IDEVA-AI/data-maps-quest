import { supabase } from '@/lib/supabase';
import { ApiResponse } from './api';
import { authService } from './authService';

export interface Contato {
  id: number;
  empresa: string;
  telefone: string;
  template: string;
  status: 'Pendente' | 'Enviado';
  consulta_id: number;
  sent_at?: string;
  error_message?: string;
  created_at?: string;
  updated_at?: string;
  // Campos para admin/analista
  usuario_nome?: string;
  usuario_email?: string;
}

export interface DisparoStats {
  totalContatos: number;
  pendentes: number;
  enviados: number;
  erros: number;
}

export interface DisparoFilters {
  consulta_id?: number;
  status?: string;
  empresa?: string;
  page?: number;
  limit?: number;
}

export interface TemplateGenerationRequest {
  contato_id: number;
  empresa: string;
  categoria?: string;
}

export interface MessageSendRequest {
  contato_id: number;
  telefone: string;
  template: string;
}

class DisparoService {
  // Get contatos for a specific consulta (using resultados table with role-based access control)
  async getContatosByConsulta(consultaId: number, filters?: DisparoFilters): Promise<ApiResponse<Contato[]>> {
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

      // First, verify if user has access to this consulta
      if (!canViewAllUsers) {
        const { data: consultaData, error: consultaError } = await supabase
          .from('consultas')
          .select('id_usuario')
          .eq('id_consulta', consultaId)
          .single();

        if (consultaError || !consultaData || consultaData.id_usuario !== currentUser.id_usuario) {
          return {
            success: false,
            error: 'Acesso negado a esta consulta'
          };
        }
      }

      let query = supabase
        .from('resultados')
        .select(`
          id_resultado,
          id_consulta,
          nomeempresa,
          telefone,
          template,
          status,
          createdat,
          updated_at
        `)
        .eq('id_consulta', consultaId)
        .order('createdat', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.empresa) {
        query = query.ilike('nomeempresa', `%${filters.empresa}%`);
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      const contatos: Contato[] = (data || []).map(resultado => {
        const contato: Contato = {
          id: resultado.id_resultado,
          empresa: resultado.nomeempresa || '',
          telefone: resultado.telefone || '',
          template: resultado.template || '',
          status: resultado.status || 'Pendente',
          consulta_id: resultado.id_consulta,
          created_at: resultado.createdat,
          updated_at: resultado.updated_at
        };

        // Add user info only if user has permission
        if (canViewUserNames && resultado.consultas?.usuarios) {
          contato.usuario_nome = resultado.consultas.usuarios.nome;
          contato.usuario_email = resultado.consultas.usuarios.email;
        }

        return contato;
      });

      return {
        success: true,
        data: contatos
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  // Get disparo statistics for a consulta
  async getDisparoStats(consultaId: number): Promise<ApiResponse<DisparoStats>> {
    try {
      const { data, error } = await supabase
        .from('resultados')
        .select('status')
        .eq('id_consulta', consultaId);

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      const stats = {
        totalContatos: data?.length || 0,
        pendentes: data?.filter(r => r.status === 'Pendente').length || 0,
        enviados: data?.filter(r => r.status === 'Enviado').length || 0,
        erros: data?.filter(r => r.status === 'Erro').length || 0
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

  // Generate template for a specific contato
  async generateTemplate(request: TemplateGenerationRequest): Promise<ApiResponse<{ template: string }>> {
    // For now, return a default template
    const defaultTemplate = `Olá, 
 
 Nossa equipe preparou um novo site para a ${request.empresa} e gostaríamos de apresentá-lo, sem nenhum custo ou compromisso. 
 
 Qual seria o melhor horário para agendarmos uma breve demonstração? 
 
 Atenciosamente, 
 Equipe IDEVA(Especialistas em Automação de Sistemas)`;

    return {
      success: true,
      data: { template: defaultTemplate }
    };
  }

  // Generate templates for all pending contatos in a consulta
  async generateAllTemplates(consultaId: number): Promise<ApiResponse<{ count: number }>> {
    try {
      const { data, error } = await supabase
        .from('resultados')
        .select('id_resultado, nomeempresa')
        .eq('id_consulta', consultaId)
        .eq('status', 'Pendente');

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      // Update all pending results with default template
      const defaultTemplate = `Olá, 
 
 Nossa equipe preparou um novo site para a sua empresa e gostaríamos de apresentá-lo, sem nenhum custo ou compromisso. 
 
 Qual seria o melhor horário para agendarmos uma breve demonstração? 
 
 Atenciosamente, 
 Equipe IDEVA(Especialistas em Automação de Sistemas)`;

      const updates = (data || []).map(resultado => ({
        id_resultado: resultado.id_resultado,
        template: defaultTemplate.replace('sua empresa', resultado.nomeempresa || 'sua empresa')
      }));

      for (const update of updates) {
        await supabase
          .from('resultados')
          .update({ template: update.template })
          .eq('id_resultado', update.id_resultado);
      }

      return {
        success: true,
        data: { count: updates.length }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  // Send message to a specific contato
  async sendMessage(request: MessageSendRequest): Promise<ApiResponse<{ sent: boolean }>> {
    try {
      // Update status to 'Enviado'
      const { error } = await supabase
        .from('resultados')
        .update({ 
          status: 'Enviado',
          updated_at: new Date().toISOString()
        })
        .eq('id_resultado', request.contato_id);

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true,
        data: { sent: true }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  // Send messages to all pending contatos in a consulta
  async sendAllMessages(consultaId: number): Promise<ApiResponse<{ count: number }>> {
    try {
      const { data, error } = await supabase
        .from('resultados')
        .update({ 
          status: 'Enviado',
          updated_at: new Date().toISOString()
        })
        .eq('id_consulta', consultaId)
        .eq('status', 'Pendente')
        .select('id_resultado');

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true,
        data: { count: data?.length || 0 }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  // Update contato template
  async updateContatoTemplate(contatoId: number, template: string): Promise<ApiResponse<Contato>> {
    try {
      const { data, error } = await supabase
        .from('resultados')
        .update({ 
          template,
          updated_at: new Date().toISOString()
        })
        .eq('id_resultado', contatoId)
        .select(`
          id_resultado,
          id_consulta,
          nomeempresa,
          telefone,
          template,
          status,
          createdat,
          updated_at
        `)
        .single();

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      const contato: Contato = {
        id: data.id_resultado,
        empresa: data.nomeempresa || '',
        telefone: data.telefone || '',
        template: data.template || '',
        status: data.status || 'Pendente',
        consulta_id: data.id_consulta,
        created_at: data.createdat,
        updated_at: data.updated_at
      };

      return {
        success: true,
        data: contato
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  // Update contato status
  async updateContatoStatus(contatoId: number, status: Contato['status']): Promise<ApiResponse<Contato>> {
    try {
      const { data, error } = await supabase
        .from('resultados')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id_resultado', contatoId)
        .select(`
          id_resultado,
          id_consulta,
          nomeempresa,
          telefone,
          template,
          status,
          createdat,
          updated_at
        `)
        .single();

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      const contato: Contato = {
        id: data.id_resultado,
        empresa: data.nomeempresa || '',
        telefone: data.telefone || '',
        template: data.template || '',
        status: data.status || 'Pendente',
        consulta_id: data.id_consulta,
        created_at: data.createdat,
        updated_at: data.updated_at
      };

      return {
        success: true,
        data: contato
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  // Get contato by ID
  async getContatoById(contatoId: number): Promise<ApiResponse<Contato>> {
    try {
      const { data, error } = await supabase
        .from('resultados')
        .select(`
          id_resultado,
          id_consulta,
          nomeempresa,
          telefone,
          template,
          status,
          createdat,
          updated_at
        `)
        .eq('id_resultado', contatoId)
        .single();

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      const contato: Contato = {
        id: data.id_resultado,
        empresa: data.nomeempresa || '',
        telefone: data.telefone || '',
        template: data.template || '',
        status: data.status || 'Pendente',
        consulta_id: data.id_consulta,
        created_at: data.createdat,
        updated_at: data.updated_at
      };

      return {
        success: true,
        data: contato
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  // Get all disparos for history (with role-based access control)
  async getAllDisparos(filters?: DisparoFilters): Promise<ApiResponse<Contato[]>> {
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
      let query;
      
      if (canViewUserNames) {
        query = supabase
          .from('resultados')
          .select(`
            id_resultado,
            id_consulta,
            nomeempresa,
            telefone,
            template,
            status,
            createdat,
            updated_at,
            consultas!inner(id_usuario, usuarios!inner(nome, email))
          `);
      } else {
        query = supabase
          .from('resultados')
          .select(`
            id_resultado,
            id_consulta,
            nomeempresa,
            telefone,
            template,
            status,
            createdat,
            updated_at,
            consultas!inner(id_usuario)
          `);
      }

      // Apply role-based filtering
      if (!canViewAllUsers) {
        query = query.eq('consultas.id_usuario', currentUser.id_usuario);
      }

      query = query.order('updated_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.empresa) {
        query = query.ilike('nomeempresa', `%${filters.empresa}%`);
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      const contatos: Contato[] = (data || []).map(resultado => {
        const contato: Contato = {
          id: resultado.id_resultado,
          empresa: resultado.nomeempresa || '',
          telefone: resultado.telefone || '',
          template: resultado.template || '',
          status: resultado.status || 'Pendente',
          consulta_id: resultado.id_consulta,
          created_at: resultado.createdat,
          updated_at: resultado.updated_at
        };

        // Add user info only if user has permission
        if (canViewUserNames && resultado.consultas?.usuarios) {
          contato.usuario_nome = resultado.consultas.usuarios.nome;
          contato.usuario_email = resultado.consultas.usuarios.email;
        }

        return contato;
      });

      return {
        success: true,
        data: contatos
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  // Get disparo history with aggregated data
  async getDisparoHistory(filters?: DisparoFilters): Promise<ApiResponse<any[]>> {
    // For now, return the same as getAllDisparos
    return this.getAllDisparos(filters);
  }
}

export const disparoService = new DisparoService();