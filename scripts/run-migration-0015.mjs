// Script para aplicar a migration 0015 - Todos os pedidos vão direto para "preparando"
// Usa a função apply_migration_sql via RPC do Supabase

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

console.log('🔧 Aplicando migration 0015 - Pedidos direto para Preparando');
console.log('🔗 URL:', SUPABASE_URL);

// Lê o SQL da migration 0015
const migrationPath = join(__dirname, '..', 'supabase', 'migrations', '0015_orders_direct_to_preparing.sql');
const sql = readFileSync(migrationPath, 'utf-8');
console.log('📄 SQL carregado:', sql.length, 'caracteres');

// Tenta aplicar via RPC apply_migration_sql
async function applyMigration() {
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
      console.log('✅ Migration 0015 aplicada com sucesso!');
      console.log('📋 Resultado:', data);
      console.log('\n🎯 Todos os novos pedidos agora vão direto para a coluna 👨‍🍳 Preparando!');
      console.log('🔄 Pedidos existentes com status "aguardando_pagamento" foram movidos para "preparando".');
    } else {
      const error = await response.text();
      console.log('❌ Erro ao aplicar migration:', error.substring(0, 500));
      console.log('\n⚠️ Tente aplicar manualmente no Supabase SQL Editor:');
      console.log('1. Acesse https://supabase.com/dashboard');
      console.log('2. Vá para SQL Editor');
      console.log('3. Cole o conteúdo do arquivo supabase/migrations/0015_orders_direct_to_preparing.sql');
      console.log('4. Execute o SQL');
    }
  } catch (error) {
    console.log('❌ Erro de conexão:', error.message);
    console.log('\n⚠️ Tente aplicar manualmente no Supabase SQL Editor.');
  }
}

applyMigration();
