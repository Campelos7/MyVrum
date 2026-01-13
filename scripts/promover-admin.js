/**
 * Script para promover um utilizador existente a administrador
 * 
 * Uso: node scripts/promover-admin.js <email>
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function promoverAdmin() {
  try {
    const email = process.argv[2];
    
    if (!email) {
      console.log('Uso: node scripts/promover-admin.js <email>');
      console.log('Exemplo: node scripts/promover-admin.js user@example.com');
      await prisma.$disconnect();
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log(`❌ Utilizador com email "${email}" não encontrado!`);
      await prisma.$disconnect();
      return;
    }

    if (user.admin) {
      console.log(`✅ O utilizador "${email}" já é administrador!`);
      await prisma.$disconnect();
      return;
    }

    const updated = await prisma.user.update({
      where: { email },
      data: {
        admin: true,
        emailValidado: true,
      },
    });

    console.log(`\n✅ Utilizador promovido a administrador com sucesso!`);
    console.log(`   Email: ${updated.email}`);
    console.log(`   Nome: ${updated.firstName} ${updated.lastName}`);
    console.log('\n⚠️  IMPORTANTE:');
    console.log('1. Faz LOGOUT da tua conta');
    console.log('2. Faz LOGIN novamente');
    console.log('3. Agora já deves conseguir aceder ao backoffice!');

  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

promoverAdmin();

