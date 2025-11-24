import { supabase } from '@/lib/supabase';

export interface Produto {
    id: string;
    nome: string;
    preco: number;
    qtd_tokens: number;
    validade_dias: number;
    beneficios_html: string;
    eh_popular: boolean;
    external_id?: string;
}

export interface ProductResponse {
    success: boolean;
    data?: Produto[];
    error?: string;
}

class ProductService {
    async getProducts(): Promise<ProductResponse> {
        try {
            const { data, error } = await supabase
                .from('produto')
                .select('*')
                .order('preco', { ascending: true });

            if (error) {
                console.error('Erro ao buscar produtos:', error);
                return { success: false, error: 'Erro ao carregar produtos' };
            }

            return { success: true, data: data as Produto[] };
        } catch (error) {
            console.error('Erro inesperado ao buscar produtos:', error);
            return { success: false, error: 'Erro interno do servidor' };
        }
    }
}

export const productService = new ProductService();
