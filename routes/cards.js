const express = require("express");
const router = express.Router();
const { verificarToken } = require("../middlewares/authmiddlewares");
const upload = require("../middlewares/uploadmiddlewares");
const {
    crearArticulo,
    obtenerArticulos,
    obtenerArticuloPorId,
    actualizarArticulo,
    eliminarArticulo,
    agregarFavorito,
    obtenerFavoritos,
    eliminarFavorito,
} = require("../consultas");

router.post("/articulos", verificarToken, upload.single("img"), crearArticulo);         
router.get("/articulos", obtenerArticulos);                                             
router.get("/articulos/:id", obtenerArticuloPorId);                                     
router.put("/articulos/:id", verificarToken, upload.single("img"), actualizarArticulo); 
router.delete("/articulos/:id", verificarToken, eliminarArticulo);                      

router.post("/favoritos", verificarToken, agregarFavorito);           
router.get("/favoritos", verificarToken, obtenerFavoritos);           
router.delete("/favoritos/:id", verificarToken, eliminarFavorito);    

module.exports = router;
