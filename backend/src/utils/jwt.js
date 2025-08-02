const jwt = require('jsonwebtoken');

exports.generateToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      roles: user.roles,
      clienteId: user.clienteId
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};
