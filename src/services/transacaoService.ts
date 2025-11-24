import { supabase } from '@/lib/supabase';

export interface Transacao {
    id_transacao?: number;
    id_usuario: number;
    produto_id: string;
    valor: number;
    qtd_tokens: number;
    metodo_pagamento?: string;
    created_at?: string;
    updated_at?: string;
}

export interface TransacaoResponse {
    success: boolean;
    data?: Transacao;
    error?: string;
}

class TransacaoService {
    async create(transacao: Omit<Transacao, 'id_transacao' | 'created_at' | 'updated_at'>): Promise<TransacaoResponse> {
        try {
            const { data, error } = await supabase
                .from('transacoes')
                .insert([transacao])
                .select()
                .single();

            if (error) {
                console.error('Erro ao criar transação:', error);
                return { success: false, error: 'Erro ao registrar transação' };
            }

            return { success: true, data: data as Transacao };
        } catch (error) {
            console.error('Erro inesperado ao criar transação:', error);
            return { success: false, error: 'Erro interno do servidor' };
        }
    }

    async getByUserId(userId: number): Promise<{ success: boolean; data?: Transacao[]; error?: string }> {
        try {
            const { data, error } = await supabase
                .from('transacoes')
                .select('*')
                .eq('id_usuario', userId)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Erro ao buscar transações do usuário:', error);
                return { success: false, error: 'Erro ao buscar histórico' };
            }

            return { success: true, data: data as Transacao[] };
        } catch (error) {
            console.error('Erro inesperado ao buscar transações:', error);
            return { success: false, error: 'Erro interno do servidor' };
        }
    }
}

export const transacaoService = new TransacaoService();
