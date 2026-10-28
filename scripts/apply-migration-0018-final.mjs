// Script para aplicar a migration 0018 (consolidated_payment_flow) no Supabase
// Usa a SERVICE_ROLE_KEY para ter permissão total no banco
//
// Executar: node scripts/apply-migration-0018-final.mjs

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Carrega o .env manualmente
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
        // Remove aspas
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
const SERVICE_ROLE_KEY = envVars.SUPABASE_SERVICE_ROLE_KEY || '';

console.log('🔧 Script de aplicação da migration 0018 (consolidated_payment_flow)');
console.log('🔗 URL:', SUPABASE_URL);
console.log('🔑 Service Role Key:', SERVICE_ROLE_KEY ? `${SERVICE_ROLE_KEY.substring(0, 20)}...` : '(não encontrada)');

if (!SERVICE_ROLE_KEY || SERVICE_ROLE_KEY.includes('xxxx')) {
  console.log('\n❌ Service Role Key não encontrada ou inválida no .env');
  console.log('   Para aplicar as migrations, execute manualmente no Supabase Dashboard:');
  console.log('   1. Acesse: https://supabase.com/dashboard/project/lstycewiltrbefrxicdx/sql');
  console.log('   2. Copie o conteúdo de supabase/migrations/0018_consolidated_payment_flow.sql');
  console.log('   3. Cole no editor SQL e clique em RUN');
  process.exit(1);
}

// Lê o SQL da migration 0018
const migrationPath = join(__dirname, '..', 'supabase', 'migrations', '0018_consolidated_payment_flow.sql');
const fullSQL = readFileSync(migrationPath, 'utf-8');
console.log('\n📄 Migration 0018 carregada:', fullSQL.length, 'caracteres');

// Método 1: Tenta usar a função apply_migration_sql via RPC com service role
async function tryRPC(sql) {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/apply_migration_sql`, {
      method: 'POST',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({ _sql: sql }),
    });
    
    if (response.ok) {
      const data = await response.text();
      console.log('✅ RPC apply_migration_sql executado com sucesso!');
      return true;
    } else {
      const error = await response.text();
      console.log('⚠️ RPC apply_migration_sql falhou:', error.substring(0, 300));
      return false;
    }
  } catch (error) {
    console.log('⚠️ Erro RPC:', error.message);
    return false;
  }
}

// Método 2: Executa via GraphQL/PostgREST com service role
async function tryPostgREST(sql) {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/sql`, {
      method: 'POST',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({ query: sql }),
    });
    
    if (response.ok) {
      console.log('✅ PostgREST sql() executado com sucesso!');
      return true;
    } else {
      const error = await response.text();
      console.log('⚠️ PostgREST falhou:', error.substring(0, 300));
      return false;
    }
  } catch (error) {
    console.log('⚠️ Erro PostgREST:', error.message);
    return false;
  }
}

// Método 3: Verifica se as funções já existem
async function checkFunctions() {
  console.log('\n🔍 Verificando funções existentes no banco...');
  
  const functions = [
    'criar_pedido_online',
    'registrar_venda',
    'confirmar_pagamento_online',
  ];
  
  for (const func of functions) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${func}?_help=true`, {
        method: 'GET',
        headers: {
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        },
      });
      
      if (response.ok || response.status === 400) {
        console.log(`  ✅ Função ${func} existe no banco`);
      } else {
        console.log(`  ❌ Função ${func} NÃO encontrada no banco`);
      }
    } catch (error) {
      console.log(`  ❌ Erro ao verificar ${func}:`, error.message);
    }
  }
}

// Método 4: Verifica as colunas da tabela pedidos_online
async function checkColumns() {
  console.log('\n🔍 Verificando colunas da tabela pedidos_online...');
  
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/pedidos_online?select=*&limit=0`, {
      method: 'GET',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      },
    });
    
    if (response.ok) {
      const text = await response.text();
      console.log('  ✅ Tabela pedidos_online acessível');
      console.log('  Response:', text.substring(0, 200));
    } else {
      console.log('  ❌ Erro ao acessar pedidos_online:', response.status);
    }
  } catch (error) {
    console.log('  ❌ Erro:', error.message);
  }
}

// Método 5: Verifica pedidos existentes
async function checkOrders() {
  console.log('\n🔍 Verificando pedidos existentes...');
  
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/pedidos_online?select=status,status_delivery,cliente,created_at&order=created_at.desc&limit=5`, {
      method: 'GET',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log(`  📦 ${data.length} pedidos encontrados:`);
      data.forEach((order, i) => {
        console.log(`    ${i+1}. Cliente: ${order.cliente}, Status: ${order.status}, Delivery: ${order.status_delivery}, Criado: ${order.created_at}`);
      });
    } else {
      console.log('  ❌ Erro ao buscar pedidos:', response.status);
    }
  } catch (error) {
    console.log('  ❌ Erro:', error.message);
  }
}

// Executa todos os métodos
async function main() {
  console.log('\n=== FASE 1: Verificação do estado atual ===');
  await checkFunctions();
  await checkColumns();
  await checkOrders();
  
  console.log('\n=== FASE 2: Tentando aplicar migration ===');
  
  // Tenta RPC primeiro
  if (await tryRPC(fullSQL)) {
    console.log('\n✅ Migration aplicada com sucesso via RPC!');
    return;
  }
  
  // Tenta PostgREST
  if (await tryPostgREST(fullSQL)) {
    console.log('\n✅ Migration aplicada com sucesso via PostgREST!');
    return;
  }
  
  console.log('\n⚠️ Não foi possível aplicar automaticamente.');
  console.log('\n📋 INSTRUÇÕES MANUAIS:');
  console.log('   1. Acesse: https://supabase.com/dashboard/project/lstycewiltrbefrxicdx/sql');
  console.log('   2. Copie o conteúdo de supabase/migrations/0018_consolidated_payment_flow.sql');
  console.log('   3. Cole no editor SQL e clique em RUN');
  console.log('   4. Aguarde a execução completar');
  console.log('   5. Execute este script novamente para verificar');
}

main().catch(console.error);
