const jwt = require('jsonwebtoken');
const config = require('../config');

const TOKEN_TYPES = {
  USER: 'user',
  DEVICE: 'device',
};

const signUserToken = (payload, options = {}) => {
  const enrichedPayload = { ...payload, tokenType: TOKEN_TYPES.USER };
  return jwt.sign(enrichedPayload, config.jwt.userSecret, {
    expiresIn: config.jwt.userExpiresIn,
    ...options,
  });
};

const signDeviceToken = (payload, options = {}) => {
  const enrichedPayload = { ...payload, tokenType: TOKEN_TYPES.DEVICE };
  return jwt.sign(enrichedPayload, config.jwt.deviceSecret, {
    expiresIn: config.jwt.deviceExpiresIn,
    ...options,
  });
};

const verifyAnyToken = (token) => {
  try {
    const decoded = jwt.verify(token, config.jwt.userSecret);
    return { payload: decoded, tokenType: TOKEN_TYPES.USER };
  } catch (userErr) {
    try {
      const decoded = jwt.verify(token, config.jwt.deviceSecret);
      return { payload: decoded, tokenType: TOKEN_TYPES.DEVICE };
    } catch (deviceErr) {
      const err = new Error('Invalid token');
      err.name = 'JsonWebTokenError';
      throw err;
    }
  }
};

module.exports = {
  TOKEN_TYPES,
  signUserToken,
  signDeviceToken,
  verifyAnyToken,
};

