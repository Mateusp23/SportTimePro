const jwt = require('jsonwebtoken');

exports.generateToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      role: user.role,
      clienteId: user.clienteId
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};
