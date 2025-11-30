// src/utils/gerarHash.js
const crypto = require("crypto");

function gerarHashIndicacao() {
  return crypto.randomBytes(16).toString("hex"); // 32 caracteres
}

module.exports = { gerarHashIndicacao };
