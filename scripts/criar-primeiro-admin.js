/**
 * Script para criar o primeiro administrador
 * 
 * Uso: node scripts/criar-primeiro-admin.js
 * 
 * Este script cria o primeiro administrador diretamente na base de dados.
 * Só deve ser usado se não existir nenhum administrador no sistema.
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const readline = require('readline');

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function criarPrimeiroAdmin() {
  try {
    console.log('=== Criar Primeiro Administrador ===\n');

    // Verificar se já existe algum admin
    const adminExistente = await prisma.user.findFirst({
      where: { admin: true }
    });

    if (adminExistente) {
      console.log('⚠️  Já existe pelo menos um administrador no sistema!');
      console.log(`   Email: ${adminExistente.email}`);
      console.log('\nSe quiseres criar outro admin, usa o backoffice em vez deste script.');
      rl.close();
      await prisma.$disconnect();
      return;
    }

    // Pedir dados
    const firstName = await question('Primeiro Nome: ');
    const lastName = await question('Último Nome: ');
    const username = await question('Username: ');
    const email = await question('Email: ');
    const password = await question('Password: ');
    const phone = await question('Telefone (opcional): ') || '';
    const address = await question('Morada (opcional): ') || '';

    if (!firstName || !lastName || !username || !email || !password) {
      console.log('\n❌ Erro: Primeiro Nome, Último Nome, Username, Email e Password são obrigatórios!');
      rl.close();
      await prisma.$disconnect();
      return;
    }

    // Verificar se email já existe
    const emailExistente = await prisma.user.findUnique({
      where: { email }
    });

    if (emailExistente) {
      console.log('\n❌ Erro: Este email já está em uso!');
      rl.close();
      await prisma.$disconnect();
      return;
    }

    // Verificar se username já existe
    const usernameExistente = await prisma.user.findUnique({
      where: { username }
    });

    if (usernameExistente) {
      console.log('\n❌ Erro: Este username já está em uso!');
      rl.close();
      await prisma.$disconnect();
      return;
    }

    // Hash da password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar admin
    const novoAdmin = await prisma.user.create({
      data: {
        firstName,
        lastName,
        username,
        email,
        password: hashedPassword,
        phone: phone || '',
        country: '+351',
        address: address || '',
        admin: true,
        emailValidado: true,
      },
    });

    console.log('\n✅ Administrador criado com sucesso!');
    console.log(`   ID: ${novoAdmin.id}`);
    console.log(`   Nome: ${novoAdmin.firstName} ${novoAdmin.lastName}`);
    console.log(`   Email: ${novoAdmin.email}`);
    console.log(`   Username: ${novoAdmin.username}`);
    console.log('\nAgora podes fazer login com esta conta e aceder ao backoffice!');

  } catch (error) {
    console.error('\n❌ Erro ao criar administrador:', error);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

criarPrimeiroAdmin();

