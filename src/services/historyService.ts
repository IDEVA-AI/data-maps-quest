import { apiService, ApiResponse } from './api';

export interface HistoryEntry {
  id: number;
  type: 'consulta' | 'disparo' | 'template' | 'message';
  action: string;
  description: string;
  entity_id: number;
  entity_type: string;
  metadata?: any;
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
  // Get history entries with filters
  async getHistory(filters?: HistoryFilters): Promise<ApiResponse<HistoryEntry[]>> {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `/history${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiService.get<HistoryEntry[]>(endpoint);
  }

  // Get recent history for dashboard
  async getRecentHistory(limit: number = 10): Promise<ApiResponse<HistoryEntry[]>> {
    return apiService.get<HistoryEntry[]>(`/history/recent?limit=${limit}`);
  }

  // Get history statistics
  async getHistoryStats(): Promise<ApiResponse<HistoryStats>> {
    return apiService.get<HistoryStats>('/history/stats');
  }

  // Get activity summary by date range
  async getActivitySummary(dateFrom: string, dateTo: string): Promise<ApiResponse<ActivitySummary[]>> {
    const queryParams = new URLSearchParams({
      dateFrom,
      dateTo,
    });
    
    return apiService.get<ActivitySummary[]>(`/history/activity-summary?${queryParams.toString()}`);
  }

  // Get history for a specific entity
  async getEntityHistory(entityType: string, entityId: number): Promise<ApiResponse<HistoryEntry[]>> {
    return apiService.get<HistoryEntry[]>(`/history/entity/${entityType}/${entityId}`);
  }

  // Create a new history entry (for manual logging)
  async createHistoryEntry(entry: Omit<HistoryEntry, 'id' | 'created_at'>): Promise<ApiResponse<HistoryEntry>> {
    return apiService.post<HistoryEntry>('/history', entry);
  }

  // Get user activity history
  async getUserHistory(userId: number, filters?: HistoryFilters): Promise<ApiResponse<HistoryEntry[]>> {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `/history/user/${userId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiService.get<HistoryEntry[]>(endpoint);
  }

  // Delete old history entries (cleanup)
  async cleanupHistory(olderThanDays: number): Promise<ApiResponse<{ deletedCount: number }>> {
    return apiService.delete<{ deletedCount: number }>(`/history/cleanup?days=${olderThanDays}`);
  }
}

export const historyService = new HistoryService();