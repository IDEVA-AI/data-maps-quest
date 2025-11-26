/**
 * Utilitário para geração e download de arquivos CSV
 * Suporta UTF-8 com BOM para compatibilidade com Excel
 */

export interface CSVColumn {
  key: string;
  header: string;
  formatter?: (value: unknown) => string;
}

export interface CSVOptions {
  filename: string;
  delimiter?: string;
  includeHeaders?: boolean;
  encoding?: 'utf-8' | 'utf-8-bom';
}

/**
 * Escapa valores para CSV, lidando com vírgulas, aspas e quebras de linha
 */
function escapeCSVValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }
  
  const stringValue = String(value);
  
  // Se contém vírgula, aspas ou quebra de linha, precisa ser escapado
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n') || stringValue.includes('\r')) {
    // Duplica aspas internas e envolve em aspas
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  
  return stringValue;
}

/**
 * Formata data para o padrão ISO 8601
 */
export function formatDateISO(date: string | Date): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return '';
  }
  
  return dateObj.toISOString();
}

/**
 * Formata data para exibição em português (DD/MM/AAAA)
 */
export function formatDateBR(date: string | Date): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return '';
  }
  
  return dateObj.toLocaleDateString('pt-BR');
}

/**
 * Formata hora para exibição (HH:MM)
 */
export function formatTime(date: string | Date): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return '';
  }
  
  return dateObj.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Formata valor monetário em reais
 */
export function formatCurrency(value: number): string {
  if (typeof value !== 'number' || isNaN(value)) {
    return 'R$ 0,00';
  }
  
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

/**
 * Gera conteúdo CSV a partir de dados e colunas
 */
export function generateCSVContent(
  data: Record<string, unknown>[],
  columns: CSVColumn[],
  options: Partial<CSVOptions> = {}
): string {
  const {
    delimiter = ',',
    includeHeaders = true,
    encoding = 'utf-8-bom'
  } = options;

  const lines: string[] = [];

  // Adiciona cabeçalhos se solicitado
  if (includeHeaders) {
    const headers = columns.map(col => escapeCSVValue(col.header));
    lines.push(headers.join(delimiter));
  }

  // Adiciona dados
  data.forEach(row => {
    const values = columns.map(col => {
      const value = row[col.key];
      const formattedValue = col.formatter ? col.formatter(value) : value;
      return escapeCSVValue(formattedValue);
    });
    lines.push(values.join(delimiter));
  });

  let content = lines.join('\n');

  // Adiciona BOM para UTF-8 se solicitado (melhora compatibilidade com Excel)
  if (encoding === 'utf-8-bom') {
    content = '\uFEFF' + content;
  }

  return content;
}

/**
 * Faz download de arquivo CSV
 */
export function downloadCSV(
  data: Record<string, unknown>[],
  columns: CSVColumn[],
  options: CSVOptions
): void {
  try {
    const content = generateCSVContent(data, columns, options);
    
    // Cria blob com encoding UTF-8
    const blob = new Blob([content], {
      type: 'text/csv;charset=utf-8;'
    });

    // Cria URL temporária
    const url = URL.createObjectURL(blob);

    // Cria elemento de download
    const link = document.createElement('a');
    link.href = url;
    link.download = options.filename;
    link.style.display = 'none';

    // Adiciona ao DOM, clica e remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Limpa URL temporária
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Erro ao fazer download do CSV:', error);
    throw new Error('Falha ao gerar arquivo CSV');
  }
}

/**
 * Valida se há dados para exportar
 */
export function validateCSVData(data: unknown[]): { isValid: boolean; message?: string } {
  if (!Array.isArray(data)) {
    return {
      isValid: false,
      message: 'Dados devem ser um array'
    };
  }

  if (data.length === 0) {
    return {
      isValid: false,
      message: 'Nenhum dado disponível para exportar'
    };
  }

  return { isValid: true };
}

/**
 * Gera nome de arquivo com timestamp
 */
export function generateFilename(baseName: string, extension: string = 'csv'): string {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
  return `${baseName}_${timestamp}.${extension}`;
}
