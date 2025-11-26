const express = require("express");
const router = express.Router();
const ResetSenhaController = require("../controllers/resetSenhaController");

router.post("/enviar-codigo", ResetSenhaController.enviarCodigo);
router.post("/verificar-codigo", ResetSenhaController.verificarCodigo);
router.post("/nova-senha", ResetSenhaController.novaSenha);

module.exports = router;
