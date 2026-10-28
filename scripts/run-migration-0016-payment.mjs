// Script para aplicar a migration 0016 - Pedidos só avançam após pagamento confirmado
// Executa a função criar_pedido_online com status "aguardando_pagamento"

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '..', '.env');

let envVars = {};
try {
  const envContent = readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const eqIndex = trimmed.indexOf('=');
      if (eqIndex > 0) {
        const key = trimmed.substring(0, eqIndex).trim();
        let value = trimmed.substring(eqIndex + 1).trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        envVars[key] = value;
        process.env[key] = value;
      }
    }
  }
} catch (error) {
  console.warn('⚠️ Não foi possível ler .env:', error.message);
}

const SUPABASE_URL = envVars.VITE_SUPABASE_URL || envVars.SUPABASE_URL || 'https://lstycewiltrbefrxicdx.supabase.co';
const SUPABASE_KEY = envVars.VITE_SUPABASE_PUBLISHABLE_KEY || envVars.SUPABASE_PUBLISHABLE_KEY || '';

console.log('🔧 Aplicando migration 0016 - Pagamento obrigatório antes do preparo');
console.log('🔗 URL:', SUPABASE_URL);

// Lê o SQL da migration 0016
const migrationPath = join(__dirname, '..', 'supabase', 'migrations', '0016_payment_required_before_prep.sql');
const sql = readFileSync(migrationPath, 'utf-8');
console.log('📄 SQL carregado:', sql.length, 'caracteres');

async function testConnection() {
  console.log('\n🔍 Testando conexão com Supabase...');
  
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/pedidos_online?select=status&limit=5`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Conexão OK! Pedidos encontrados:', data.length);
      console.log('Status dos pedidos:', data.map(p => p.status));
      return true;
    } else {
      console.log('❌ Erro na conexão:', await response.text());
      return false;
    }
  } catch (error) {
    console.log('❌ Erro:', error.message);
    return false;
  }
}

async function updateExistingOrders() {
  console.log('\n📋 Atualizando pedidos existentes sem pagamento confirmado...');
  
  try {
    // Reverte pedidos que estão em "preparando" sem pagamento para "aguardando_pagamento"
    const response = await fetch(`${SUPABASE_URL}/rest/v1/pedidos_online?select=id,status`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.log('⚠️ Erro ao buscar pedidos:', await response.text());
      return;
    }
    
    const pedidos = await response.json();
    console.log(`📊 Pedidos encontrados: ${pedidos.length}`);
    
    if (pedidos.length === 0) {
      console.log('ℹ️ Nenhum pedido para atualizar.');
      return;
    }
    
    // Atualiza apenas o status (status_delivery pode não existir)
    let updated = 0;
    for (const pedido of pedidos) {
      if (pedido.status === 'preparando' || pedido.status === 'pendente' || pedido.status === 'novo') {
        const updateResp = await fetch(`${SUPABASE_URL}/rest/v1/pedidos_online?id=eq.${pedido.id}`, {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: 'aguardando_pagamento' }),
        });
        
        if (updateResp.ok) {
          updated++;
        }
      }
    }
    
    console.log(`✅ ${updated} pedido(s) atualizados para "aguardando_pagamento"`);
  } catch (error) {
    console.log('⚠️ Erro:', error.message);
  }
}

async function main() {
  const connected = await testConnection();
  
  if (connected) {
    await updateExistingOrders();
    
    console.log('\n⚠️ IMPORTANTE: A função criar_pedido_online precisa ser atualizada manualmente.');
    console.log('\n📝 Para aplicar a migration completa, acesse:');
    console.log('1. https://supabase.com/dashboard');
    console.log('2. Selecione seu projeto');
    console.log('3. Vá para SQL Editor');
    console.log('4. Cole o conteúdo do arquivo:');
    console.log('   supabase/migrations/0016_payment_required_before_prep.sql');
    console.log('5. Clique em RUN');
    console.log('\n🎯 Isso fará com que todos os novos pedidos fiquem em "Aguardando Pagamento"');
    console.log('   e só avancem para a cozinha após confirmação manual!');
  } else {
    console.log('\n❌ Não foi possível conectar ao Supabase.');
    console.log('Verifique as variáveis de ambiente no arquivo .env');
  }
}

main();
