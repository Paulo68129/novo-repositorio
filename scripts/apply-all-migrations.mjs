// Script para aplicar TODAS as migrations pendentes (0016 e 0017)
// Aplica as funções SQL via RPC apply_migration_sql ou individualmente

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carrega o .env
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
      }
    }
  }
} catch (error) {
  console.warn('⚠️ Não foi possível ler .env:', error.message);
}

const SUPABASE_URL = envVars.VITE_SUPABASE_URL || 'https://lstycewiltrbefrxicdx.supabase.co';
const SUPABASE_KEY = envVars.VITE_SUPABASE_PUBLISHABLE_KEY || '';

console.log('🔧 Aplicando migrations pendentes (0016 e 0017)');
console.log('🔗 URL:', SUPABASE_URL);

async function executeSQL(sql, label) {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/apply_migration_sql`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({ _sql: sql }),
    });

    if (response.ok) {
      const data = await response.text();
      console.log(`✅ ${label}: Aplicado com sucesso`);
      return true;
    } else {
      const error = await response.text();
      console.log(`⚠️ ${label}: RPC falhou - ${error.substring(0, 200)}`);
      return false;
    }
  } catch (error) {
    console.log(`⚠️ ${label}: Erro RPC - ${error.message}`);
    return false;
  }
}

// Lê as migrations
const migration0016 = readFileSync(join(__dirname, '..', 'supabase', 'migrations', '0016_payment_required_before_prep.sql'), 'utf-8');
const migration0017 = readFileSync(join(__dirname, '..', 'supabase', 'migrations', '0017_all_orders_await_payment.sql'), 'utf-8');

console.log('\n📄 Migration 0016 carregada:', migration0016.length, 'caracteres');
console.log('📄 Migration 0017 carregada:', migration0017.length, 'caracteres');

// Aplica migration 0016
console.log('\n--- Aplicando Migration 0016 ---');
const result0016 = await executeSQL(migration0016, '0016 - Payment required before prep');

// Aplica migration 0017
console.log('\n--- Aplicando Migration 0017 ---');
const result0017 = await executeSQL(migration0017, '0017 - All orders await payment');

// Verifica o status das funções
console.log('\n--- Verificando funções no banco ---');

async function checkFunction(funcName) {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${funcName}`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });
    console.log(`🔍 ${funcName}: Status ${response.status}`);
  } catch (e) {
    console.log(`🔍 ${funcName}: Erro - ${e.message}`);
  }
}

await checkFunction('criar_pedido_online');
await checkFunction('registrar_venda');

console.log('\n📊 Resumo:');
console.log(`  Migration 0016: ${result0016 ? '✅ Aplicada' : '❌ Falhou'}`);
console.log(`  Migration 0017: ${result0017 ? '✅ Aplicada' : '❌ Falhou'}`);

if (!result0016 || !result0017) {
  console.log('\n⚠️ Algumas migrations falharam via RPC.');
  console.log('📋 Execute manualmente no Supabase Dashboard:');
  console.log('   1. Acesse https://supabase.com/dashboard/project/lstycewiltrbefrxicdx/sql');
  console.log('   2. Cole o conteúdo de supabase/migrations/0016_payment_required_before_prep.sql');
  console.log('   3. Clique em RUN');
  console.log('   4. Repita para 0017_all_orders_await_payment.sql');
} else {
  console.log('\n🎉 Todas as migrations aplicadas com sucesso!');
}
