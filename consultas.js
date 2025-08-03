const { Pool } = require("pg");
const jwt = require("jsonwebtoken");
const secretKey = require("./secretKey");
const bcrypt = require("bcrypt");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "patitasfelices",
  password: "postgre",
  port: 5432,
});

const registrarUsuario = async (req, res) => {
  const { nombre, email, password, direccion, telefono } = req.body;
  const imgPerfil_url = req.file ? req.file.filename : null;

  if (!nombre || !email || !password) {
    return res
      .status(400)
      .json({ error: "Nombre, email y contraseña son obligatorios." });
  }

  try {
    const existe = await pool.query(
      "SELECT id FROM usuarios WHERE email = $1",
      [email]
    );
    if (existe.rows.length > 0) {
      return res.status(409).json({ error: "El email ya está registrado." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const consulta = `
      INSERT INTO usuarios (nombre, email, password, direccion, telefono, imgPerfil_url)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const values = [
      nombre,
      email,
      hashedPassword,
      direccion,
      telefono,
      imgPerfil_url,
    ];
    const { rows } = await pool.query(consulta, values);
    const usuario = rows[0];

    const token = jwt.sign({ id: usuario.id }, secretKey, { expiresIn: "2h" });

    const { password: _, ...userWithoutPassword } = usuario;

    return res.status(201).json({ token, user: userWithoutPassword });
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    return res.status(500).json({ error: "Error al registrar usuario" });
  }
};

const loginUsuario = async (req, res) => {
  const { email, password } = req.body;

  try {
    const consulta = `SELECT * FROM usuarios WHERE email = $1 AND password = $2`;
    const { rows } = await pool.query(consulta, [email, password]);

    if (rows.length === 0) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const token = jwt.sign({ id: rows[0].id }, secretKey, { expiresIn: "2h" });
    res.status(200).json({ token, user: rows[0] });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
};

const obtenerUsuario = async (req, res) => {
  const { id } = req.params;

  try {
    const { rows } = await pool.query("SELECT * FROM usuarios WHERE id = $1", [
      id,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    res.status(500).json({ error: "Error al obtener datos de usuario" });
  }
};

const modificarUsuario = async (req, res) => {
  const { id } = req.params;
  const { nombre, email, password, direccion, telefono } = req.body;
  const imgPerfil_url = req.file ? req.file.filename : null;

  try {
    const consulta = `
      UPDATE usuarios 
      SET nombre = $1, email = $2, password = $3, direccion = $4, telefono = $5, imgPerfil_url = $6 
      WHERE id = $7
      RETURNING *;
    `;
    const values = [
      nombre,
      email,
      password,
      direccion,
      telefono,
      imgPerfil_url,
      id,
    ];

    const { rowCount, rows } = await pool.query(consulta, values);

    if (rowCount === 0) {
      return res.status(404).json({
        error: `No se consiguió ningún usuario con id ${id} para modificar`,
      });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al modificar usuario" });
  }
};

const crearArticulo = async (req, res) => {
  const { articulos, descripcion, precio, disponibilidad } = req.body;
  const propietario_ID = req.usuario.id;
  const img_url = req.file ? req.file.filename : null;

  try {
    const consulta = `
      INSERT INTO posts_productos 
      (articulos, descripcion, precio, disponibilidad, propietario_ID, fecha_publicacion, img_url) 
      VALUES ($1, $2, $3, $4, $5, NOW(), $6)
      RETURNING *;
    `;
    const values = [
      articulos,
      descripcion,
      precio,
      disponibilidad,
      propietario_ID,
      img_url,
    ];
    const { rows } = await pool.query(consulta, values);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Error al crear producto:", error);
    res.status(500).json({ error: "Error al publicar el producto" });
  }
};

const obtenerArticulos = async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM posts_productos ORDER BY fecha_publicacion DESC"
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error al obtener artículos:", error);
    res.status(500).json({ error: "Error al obtener artículos" });
  }
};

const obtenerArticuloPorId = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query(
      `
      SELECT 
        posts_productos.*, 
        usuarios.nombre AS nombre_usuario
      FROM posts_productos
      JOIN usuarios ON posts_productos.propietario_id = usuarios.id
      WHERE posts_productos.id = $1
    `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Artículo no encontrado" });
    }
    console.log("Artículo obtenido:", rows[0]);
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Error al obtener artículo:", error);
    res.status(500).json({ error: "Error al obtener artículo" });
  }
};

const actualizarArticulo = async (req, res) => {
  const { id } = req.params;
  const { articulos, descripcion, precio, disponibilidad } = req.body;
  const img_url = req.file ? req.file.filename : null;

  try {
    const consulta = `
      UPDATE posts_productos
      SET articulos = $1, descripcion = $2, precio = $3, disponibilidad = $4, img_url = $5
      WHERE id = $6
      RETURNING *;
    `;
    const values = [
      articulos,
      descripcion,
      precio,
      disponibilidad,
      img_url,
      id,
    ];
    const { rows, rowCount } = await pool.query(consulta, values);

    if (rowCount === 0) {
      return res
        .status(404)
        .json({ error: "Artículo no encontrado para actualizar" });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Error al actualizar artículo:", error);
    res.status(500).json({ error: "Error al actualizar artículo" });
  }
};

const eliminarArticulo = async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await pool.query(
      "DELETE FROM posts_productos WHERE id = $1",
      [id]
    );

    if (rowCount === 0) {
      return res
        .status(404)
        .json({ error: "Artículo no encontrado para eliminar" });
    }

    res.status(200).json({ mensaje: "Artículo eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar artículo:", error);
    res.status(500).json({ error: "Error al eliminar artículo" });
  }
};

const agregarFavorito = async (req, res) => {
  const { articulo_ID } = req.body;
  const interesado_ID = req.usuario.id;

  try {
    const consulta = `
      INSERT INTO favoritos (interesado_ID, articulo_ID)
      VALUES ($1, $2)
      RETURNING *;
    `;
    const values = [interesado_ID, articulo_ID];
    const { rows } = await pool.query(consulta, values);
    res.status(200).json({ mensaje: "Favorito agregado", favorito: rows[0] });
  } catch (error) {
    console.error("Error al agregar favorito:", error);
    res.status(500).json({ error: "Error al agregar favorito" });
  }
};

const obtenerFavoritos = async (req, res) => {
  const usuarioId = req.usuario.id;
  try {
    const consulta = `
      SELECT f.id AS favorito_id, p.*
      FROM favoritos f
      JOIN posts_productos p ON f.articulo_ID = p.id
      WHERE f.interesado_ID = $1
    `;
    const { rows } = await pool.query(consulta, [usuarioId]);
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error al obtener favoritos:", error);
    res.status(500).json({ error: "Error al obtener favoritos" });
  }
};

const eliminarFavorito = async (req, res) => {
  const { id } = req.params;

  try {
    const consulta = `DELETE FROM favoritos WHERE id = $1`;
    const { rowCount } = await pool.query(consulta, [id]);

    if (rowCount === 0) {
      return res
        .status(404)
        .json({ error: "Favorito no encontrado para eliminar" });
    }

    res.status(200).json({ mensaje: "Favorito eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar favorito:", error);
    res.status(500).json({ error: "Error al eliminar favorito" });
  }
};

module.exports = {
  registrarUsuario,
  loginUsuario,
  obtenerUsuario,
  modificarUsuario,
  crearArticulo,
  obtenerArticulos,
  obtenerArticuloPorId,
  actualizarArticulo,
  eliminarArticulo,
  agregarFavorito,
  obtenerFavoritos,
  eliminarFavorito,
};
