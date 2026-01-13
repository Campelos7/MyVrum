const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listarAdmins() {
  try {
    const admins = await prisma.user.findMany({
      where: { admin: true },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        admin: true,
        emailValidado: true,
        bloqueado: true,
      },
    });

    console.log('\n=== Administradores na Base de Dados ===\n');
    if (admins.length === 0) {
      console.log('❌ Não há administradores na base de dados!');
    } else {
      admins.forEach((admin, idx) => {
        console.log(`${idx + 1}. ${admin.firstName} ${admin.lastName}`);
        console.log(`   Email: ${admin.email}`);
        console.log(`   ID: ${admin.id}`);
        console.log(`   Admin: ${admin.admin ? '✅ SIM' : '❌ NÃO'}`);
        console.log(`   Email Validado: ${admin.emailValidado ? '✅ SIM' : '❌ NÃO'}`);
        console.log(`   Bloqueado: ${admin.bloqueado ? '❌ SIM' : '✅ NÃO'}`);
        console.log('');
      });
    }
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listarAdmins();

