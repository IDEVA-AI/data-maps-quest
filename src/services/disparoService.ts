import { apiService, ApiResponse } from './api';

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
  // Get contatos for a specific consulta
  async getContatosByConsulta(consultaId: number, filters?: DisparoFilters): Promise<ApiResponse<Contato[]>> {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `/disparos/consulta/${consultaId}/contatos${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiService.get<Contato[]>(endpoint);
  }

  // Get disparo statistics for a consulta
  async getDisparoStats(consultaId: number): Promise<ApiResponse<DisparoStats>> {
    return apiService.get<DisparoStats>(`/disparos/consulta/${consultaId}/stats`);
  }

  // Generate template for a specific contato
  async generateTemplate(request: TemplateGenerationRequest): Promise<ApiResponse<{ template: string }>> {
    return apiService.post<{ template: string }>('/disparos/generate-template', request);
  }

  // Generate templates for all pending contatos in a consulta
  async generateAllTemplates(consultaId: number): Promise<ApiResponse<{ count: number }>> {
    return apiService.post<{ count: number }>(`/disparos/consulta/${consultaId}/generate-all`);
  }

  // Send message to a specific contato
  async sendMessage(request: MessageSendRequest): Promise<ApiResponse<{ sent: boolean }>> {
    return apiService.post<{ sent: boolean }>('/disparos/send-message', request);
  }

  // Send messages to all pending contatos in a consulta
  async sendAllMessages(consultaId: number): Promise<ApiResponse<{ count: number }>> {
    return apiService.post<{ count: number }>(`/disparos/consulta/${consultaId}/send-all`);
  }

  // Update contato template
  async updateContatoTemplate(contatoId: number, template: string): Promise<ApiResponse<Contato>> {
    return apiService.put<Contato>(`/disparos/contatos/${contatoId}/template`, { template });
  }

  // Update contato status
  async updateContatoStatus(contatoId: number, status: Contato['status']): Promise<ApiResponse<Contato>> {
    return apiService.put<Contato>(`/disparos/contatos/${contatoId}/status`, { status });
  }

  // Get contato by ID
  async getContatoById(contatoId: number): Promise<ApiResponse<Contato>> {
    return apiService.get<Contato>(`/disparos/contatos/${contatoId}`);
  }

  // Get all disparos for history
  async getAllDisparos(filters?: DisparoFilters): Promise<ApiResponse<Contato[]>> {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `/disparos${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiService.get<Contato[]>(endpoint);
  }

  // Get disparo history with aggregated data
  async getDisparoHistory(filters?: DisparoFilters): Promise<ApiResponse<any[]>> {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `/disparos/history${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiService.get<any[]>(endpoint);
  }
}

export const disparoService = new DisparoService();