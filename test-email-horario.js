// Script para testar se email e horário estão sendo exibidos na página de detalhes
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qlqjqjqjqjqjqjqjqjqj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFscWpxanFqcWpxanFqcWpxanFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzE4NzEsImV4cCI6MjA1MDU0Nzg3MX0.example';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConsultaDetails() {
  try {
    console.log('🔍 Testando dados da consulta...');
    
    // Buscar uma consulta da view
    const { data: consultas, error } = await supabase
      .from('view_relatorio_consultas')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Erro ao buscar consultas:', error);
      return;
    }
    
    if (!consultas || consultas.length === 0) {
      console.log('⚠️ Nenhuma consulta encontrada');
      return;
    }
    
    const consulta = consultas[0];
    console.log('✅ Consulta encontrada:');
    console.log('📧 Email do usuário:', consulta.email_usuario || 'NÃO ENCONTRADO');
    console.log('👤 Nome do usuário:', consulta.nome_usuario || 'NÃO ENCONTRADO');
    console.log('📅 Data da consulta:', consulta.data_consulta || 'NÃO ENCONTRADO');
    
    if (consulta.data_consulta) {
      const data = new Date(consulta.data_consulta);
      console.log('📅 Data formatada:', data.toLocaleDateString('pt-BR'));
      console.log('🕐 Horário formatado:', data.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      }));
    }
    
    console.log('\n📊 Campos disponíveis na consulta:');
    Object.keys(consulta).forEach(key => {
      console.log(`  - ${key}: ${consulta[key]}`);
    });
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

testConsultaDetails();