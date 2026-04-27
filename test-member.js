const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

function sha256Hex(input) {
  return crypto.createHash('sha256').update(input, 'utf8').digest('hex');
}

async function test() {
  const prisma = new PrismaClient();

  try {
    // 查找第一个成员
    const member = await prisma.member.findFirst();
    console.log('First member:', member);

    // 测试密码哈希
    const testPassword = member.studentId; // 默认密码是学号
    const hash = sha256Hex(testPassword);
    console.log('Student ID:', member.studentId);
    console.log('Test password:', testPassword);
    console.log('Expected hash:', hash);
    console.log('Actual hash:', member.passwordHash);
    console.log('Password match:', hash === member.passwordHash);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

test();