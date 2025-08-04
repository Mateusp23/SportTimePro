require('dotenv').config();
const jwt = require('jsonwebtoken');

// Substitua pelo ID real do usuário (copiar do banco)
const userId = '4336c395-0c08-4741-a1e2-1514b28fee87';

const token = jwt.sign(
  { userId },
  process.env.JWT_SECRET,
  { expiresIn: '1h' } // Token válido por 1 hora
);

console.log('Token de confirmação:');
console.log(token);
