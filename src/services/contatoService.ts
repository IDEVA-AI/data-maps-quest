import { apiService, ApiResponse } from './api';
import { Contato } from './disparoService';

export interface ContatoFilters {
  consulta_id?: number;
  status?: string;
  empresa?: string;
  page?: number;
  limit?: number;
}

export interface ContatoStats {
  totalContatos: number;
  pendentes: number;
  enviados: number;
  erros: number;
}

class ContatoService {
  // Get all contatos with optional filters
  async getContatos(filters?: ContatoFilters): Promise<ApiResponse<Contato[]>> {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `/contatos${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiService.get<Contato[]>(endpoint);
  }

  // Get contatos for a specific consulta
  async getContatosByConsulta(consultaId: number, filters?: ContatoFilters): Promise<ApiResponse<Contato[]>> {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `/contatos/consulta/${consultaId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiService.get<Contato[]>(endpoint);
  }

  // Get a specific contato by ID
  async getContatoById(id: number): Promise<ApiResponse<Contato>> {
    return apiService.get<Contato>(`/contatos/${id}`);
  }

  // Get contato statistics
  async getContatoStats(): Promise<ApiResponse<ContatoStats>> {
    return apiService.get<ContatoStats>('/contatos/stats');
  }

  // Get contato statistics for a specific consulta
  async getContatoStatsByConsulta(consultaId: number): Promise<ApiResponse<ContatoStats>> {
    return apiService.get<ContatoStats>(`/contatos/consulta/${consultaId}/stats`);
  }

  // Create a new contato
  async createContato(contato: Omit<Contato, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Contato>> {
    return apiService.post<Contato>('/contatos', contato);
  }

  // Update a contato
  async updateContato(id: number, contato: Partial<Contato>): Promise<ApiResponse<Contato>> {
    return apiService.put<Contato>(`/contatos/${id}`, contato);
  }

  // Update contato template
  async updateContatoTemplate(id: number, template: string): Promise<ApiResponse<Contato>> {
    return apiService.put<Contato>(`/contatos/${id}/template`, { template });
  }

  // Update contato status
  async updateContatoStatus(id: number, status: Contato['status']): Promise<ApiResponse<Contato>> {
    return apiService.put<Contato>(`/contatos/${id}/status`, { status });
  }

  // Delete a contato
  async deleteContato(id: number): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`/contatos/${id}`);
  }

  // Get recent contatos for dashboard
  async getRecentContatos(limit: number = 5): Promise<ApiResponse<Contato[]>> {
    return apiService.get<Contato[]>(`/contatos/recent?limit=${limit}`);
  }
}

export const contatoService = new ContatoService();