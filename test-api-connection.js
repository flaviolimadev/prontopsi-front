#!/usr/bin/env node

/**
 * Script para testar conexão com a API
 * Uso: node test-api-connection.js [URL_DA_API]
 */

const https = require('https');
const http = require('http');

const API_URL = process.argv[2] || process.env.VITE_API_URL || 'http://localhost:3000/api';

console.log('🔍 Testando conexão com a API...');
console.log(`📍 URL: ${API_URL}`);
console.log('');

// Função para fazer requisição HTTP/HTTPS
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https://');
    const client = isHttps ? https : http;
    
    const req = client.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

// Testar endpoints
async function testEndpoints() {
  const endpoints = [
    '/health',
    '/api/health',
    '/auth/login',
    '/users/me/profile'
  ];
  
  for (const endpoint of endpoints) {
    const fullUrl = `${API_URL}${endpoint}`;
    
    try {
      console.log(`🔗 Testando: ${fullUrl}`);
      const response = await makeRequest(fullUrl);
      
      if (response.statusCode === 200) {
        console.log(`✅ ${endpoint} - OK (${response.statusCode})`);
      } else if (response.statusCode === 401) {
        console.log(`⚠️  ${endpoint} - Unauthorized (${response.statusCode}) - Normal para endpoints protegidos`);
      } else if (response.statusCode === 404) {
        console.log(`❌ ${endpoint} - Not Found (${response.statusCode})`);
      } else {
        console.log(`⚠️  ${endpoint} - Status ${response.statusCode}`);
      }
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log(`❌ ${endpoint} - Connection Refused (API não está rodando)`);
      } else if (error.code === 'ENOTFOUND') {
        console.log(`❌ ${endpoint} - Host not found (DNS não resolve)`);
      } else if (error.message === 'Timeout') {
        console.log(`⏰ ${endpoint} - Timeout (API muito lenta)`);
      } else {
        console.log(`❌ ${endpoint} - Error: ${error.message}`);
      }
    }
    
    console.log('');
  }
}

// Testar variáveis de ambiente
function testEnvironment() {
  console.log('🌍 Variáveis de Ambiente:');
  console.log(`VITE_API_URL: ${process.env.VITE_API_URL || 'Não definida'}`);
  console.log(`NODE_ENV: ${process.env.NODE_ENV || 'Não definida'}`);
  console.log('');
}

// Executar testes
async function main() {
  testEnvironment();
  await testEndpoints();
  
  console.log('📋 Resumo:');
  console.log('✅ Se todos os endpoints retornaram 200/401: API está funcionando');
  console.log('❌ Se todos retornaram Connection Refused: Backend não está rodando');
  console.log('❌ Se todos retornaram Host not found: URL da API está incorreta');
  console.log('');
  console.log('💡 Para corrigir erro 502:');
  console.log('1. Configure VITE_API_URL no Coolify');
  console.log('2. Certifique-se que o backend está rodando');
  console.log('3. Verifique se a URL da API está acessível');
}

main().catch(console.error); 