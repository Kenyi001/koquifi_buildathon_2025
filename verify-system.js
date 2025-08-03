// Script de verificación rápida del sistema KoquiFi
const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando sistema KoquiFi...\n');

// Verificar archivos críticos
const criticalFiles = [
  'package.json',
  'next.config.js',
  'tailwind.config.js', 
  'app/layout.tsx',
  'app/page.tsx',
  'components/sections/Dashboard.tsx',
  'components/ui/BalanceCards.tsx',
  'backend-server.js',
  '.env'
];

console.log('📂 Verificando archivos críticos:');
let allFilesExist = true;

criticalFiles.forEach(file => {
  const exists = fs.existsSync(file);
  const status = exists ? '✅' : '❌';
  console.log(`${status} ${file}`);
  if (!exists) allFilesExist = false;
});

// Verificar package.json
console.log('\n📦 Verificando dependencias:');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const dependencies = packageJson.dependencies || {};
  
  const requiredDeps = [
    'next',
    'react', 
    'tailwindcss',
    'framer-motion',
    '@heroicons/react',
    'express',
    'ethers'
  ];
  
  requiredDeps.forEach(dep => {
    const exists = dependencies[dep] || (packageJson.devDependencies && packageJson.devDependencies[dep]);
    const status = exists ? '✅' : '❌';
    console.log(`${status} ${dep}`);
  });
} catch (error) {
  console.log('❌ Error leyendo package.json');
}

// Verificar .env
console.log('\n🔐 Verificando configuración:');
try {
  const envContent = fs.readFileSync('.env', 'utf8');
  const requiredEnvVars = [
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET', 
    'KOQUICOIN_ADDRESS',
    'HARDHAT_RPC_URL'
  ];
  
  requiredEnvVars.forEach(envVar => {
    const exists = envContent.includes(envVar);
    const status = exists ? '✅' : '❌';
    console.log(`${status} ${envVar}`);
  });
} catch (error) {
  console.log('❌ Error leyendo .env');
}

// Verificar node_modules
console.log('\n📚 Verificando instalación:');
const nodeModulesExists = fs.existsSync('node_modules');
const nextExists = fs.existsSync('node_modules/next');
console.log(`${nodeModulesExists ? '✅' : '❌'} node_modules`);
console.log(`${nextExists ? '✅' : '❌'} Next.js instalado`);

// Resultado final
console.log('\n🎯 RESULTADO:');
if (allFilesExist && nodeModulesExists) {
  console.log('✅ Sistema KoquiFi listo para pruebas!');
  console.log('\n🚀 Próximos pasos:');
  console.log('1. Ejecutar: start-backend.bat');
  console.log('2. Ejecutar: start-frontend.bat (en nueva terminal)');
  console.log('3. Abrir: http://localhost:3000');
} else {
  console.log('❌ Sistema incompleto. Verificar archivos faltantes.');
  console.log('\n🔧 Ejecutar si es necesario:');
  console.log('npm install --legacy-peer-deps');
}

console.log('\n📋 Usar TESTING_GUIDE_MANUAL.md para pruebas detalladas');
