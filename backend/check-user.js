const { PrismaClient } = require('@prisma/client');
const argon2 = require('argon2');
const prisma = new PrismaClient();

async function resetPassword() {
  try {
    // Reset password to 'Password123' for testing
    const newPasswordHash = await argon2.hash('Password123');
    
    const user = await prisma.user.update({
      where: { email: 'joshua.hall@kag.com' },
      data: { passwordHash: newPasswordHash }
    });
    
    console.log('Password reset for:', user.email);
    console.log('New password: Password123');
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword();
