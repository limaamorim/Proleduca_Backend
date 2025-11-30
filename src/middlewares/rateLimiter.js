const rateLimit = require('express-rate-limit');

// Helper para gerar chave usando IP (trata IPv6 corretamente)
const getKey = (req) => {
  if (req.user?.id) {
    return req.user.id.toString();
  }
  return rateLimit.ipKeyGenerator(req);
};

/* ===========================================
    LIMITER GERAL (APLICADO EM TODAS ROTAS)
=========================================== */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: {
    error: 'Muitas requisições deste IP, por favor tente novamente mais tarde.',
    retryAfter: '15 minutos'
  },
  standardHeaders: true, 
  legacyHeaders: false, 
  keyGenerator: getKey,
  
  handler: (req, res) => {
    res.status(429).json({
      error: 'Muitas requisições deste IP, por favor tente novamente mais tarde.',
      retryAfter: '15 minutos'
    });
  }
});

/* ===========================================
    LIMITER DE AUTH (login / registro)
=========================================== */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 10,
  message: {
    error: 'Muitas tentativas de login. Por favor, tente novamente em 15 minutos.',
    retryAfter: '15 minutos'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false, 
  skipFailedRequests: false,

  handler: (req, res) => {
    res.status(429).json({
      error: 'Muitas tentativas de login. Por favor, tente novamente em 15 minutos.',
      retryAfter: '15 minutos'
    });
  }
});

/* ===========================================
    LIMITER PARA ROTAS PROTEGIDAS
=========================================== */
const protectedLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 200,
  message: {
    error: 'Muitas requisições. Por favor, tente novamente mais tarde.',
    retryAfter: '15 minutos'
  },
  standardHeaders: true,
  legacyHeaders: false,

  keyGenerator: (req) => {
    if (req.user?.id) {
      return `user_${req.user.id}`;
    }
    return rateLimit.ipKeyGenerator(req);
  },

  skip: (req) => !req.user,

  handler: (req, res) => {
    res.status(429).json({
      error: 'Muitas requisições. Por favor, tente novamente mais tarde.',
      retryAfter: '15 minutos'
    });
  }
});

/* ===========================================
    LIMITER ESTRITO PARA OPERAÇÕES SENSÍVEIS
=========================================== */
const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 100,
  message: {
    error: 'Limite de operações excedido. Por favor, tente novamente em 1 hora.',
    retryAfter: '1 hora'
  },
  standardHeaders: true,
  legacyHeaders: false,

  handler: (req, res) => {
    res.status(429).json({
      error: 'Limite de operações excedido. Por favor, tente novamente em 1 hora.',
      retryAfter: '1 hora'
    });
  }
});

/* ===========================================
    EXPORTAÇÃO 
=========================================== */
module.exports = {
  generalLimiter,
  authLimiter,
  protectedLimiter,
  strictLimiter
};
