/**
 * Script para verificar se um utilizador é admin
 * 
 * Uso: node scripts/verificar-admin.js <email>
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verificarAdmin() {
  try {
    const email = process.argv[2];
    
    if (!email) {
      console.log('Uso: node scripts/verificar-admin.js <email>');
      console.log('Exemplo: node scripts/verificar-admin.js admin@example.com');
      await prisma.$disconnect();
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        admin: true,
        emailValidado: true,
        bloqueado: true,
      },
    });

    if (!user) {
      console.log(`❌ Utilizador com email "${email}" não encontrado!`);
      await prisma.$disconnect();
      return;
    }

    console.log('\n=== Informações do Utilizador ===');
    console.log(`ID: ${user.id}`);
    console.log(`Nome: ${user.firstName} ${user.lastName}`);
    console.log(`Email: ${user.email}`);
    console.log(`Admin: ${user.admin ? '✅ SIM' : '❌ NÃO'}`);
    console.log(`Email Validado: ${user.emailValidado ? '✅ SIM' : '❌ NÃO'}`);
    console.log(`Bloqueado: ${user.bloqueado ? '❌ SIM' : '✅ NÃO'}`);

    if (!user.admin) {
      console.log('\n⚠️  Este utilizador NÃO é administrador!');
      console.log('Para tornar este utilizador admin, executa:');
      console.log(`  node scripts/promover-admin.js ${email}`);
    } else {
      console.log('\n✅ Este utilizador É administrador!');
      console.log('\nSe não consegues aceder ao backoffice:');
      console.log('1. Faz logout');
      console.log('2. Faz login novamente');
      console.log('3. Tenta aceder ao backoffice novamente');
    }

  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarAdmin();

