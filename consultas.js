const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "patitasfelices",
  password: "0407AE",
  port: 5432,
});

const registrarUsuario = async (req, res) => {
  const { nombre, email, password, direccion, telefono, imgperfil_url } =
    req.body;

  try {
    const hash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO usuarios (nombre, email, password, direccion, telefono, imgperfil_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [nombre, email, hash, direccion, telefono, imgperfil_url]
    );

    const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: "1h" });
    res.json({ token, email });
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    res.status(500).json({ error: "Error al registrar usuario" });
  }
};

const loginUsuario = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM usuarios WHERE email = $1", [
      email,
    ]);
    const user = result.rows[0];

    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Contraseña incorrecta" });

    const token = jwt.sign({ email: user.email }, SECRET_KEY, {
      expiresIn: "1h",
    });
    res.json({ token, email });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ error: "Error en login" });
  }
};

const modificarUsuario = async (
  id,
  nombre,
  email,
  password,
  direccion,
  telefono,
  imagenFile
) => {
  let img_url = null;

  if (imagenFile) {
    const nombreArchivo = `${Date.now()}_${imagenFile.originalname}`;
    const rutaDestino = path.join(__dirname, "uploads", nombreArchivo);
    fs.renameSync(imagenFile.path, rutaDestino);
    img_url = `/uploads/${nombreArchivo}`;
  }

  const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

  const usuarioActual = await pool.query(
    "SELECT * FROM usuarios WHERE id = $1",
    [id]
  );
  if (usuarioActual.rowCount === 0) {
    throw { code: 404, message: `Usuario con id ${id} no existe.` };
  }

  const user = usuarioActual.rows[0];

  const values = [
    nombre || user.nombre,
    email || user.email,
    hashedPassword || user.password,
    direccion || user.direccion,
    telefono || user.telefono,
    img_url || user.imgperfil_url,
    id,
  ];

  const consulta = `
    UPDATE usuarios 
    SET nombre = $1, email = $2, password = $3, direccion = $4, telefono = $5, imgPerfil_url = $6 
    WHERE id = $7
    RETURNING *;
  `;

  const { rows } = await pool.query(consulta, values);
  return rows[0];
};

const agregarPublicacion = async (req, res) => {
  try {
    const { titulo, descripcion, categoria, precio } = req.body;
    const propietario_ID = req.usuario.id;

    let img_url = null;

    if (req.file) {
      const nombreArchivo = `${Date.now()}_${req.file.originalname}`;
      const rutaDestino = path.join(__dirname, "uploads", nombreArchivo);
      fs.renameSync(req.file.path, rutaDestino);
      img_url = `/uploads/${nombreArchivo}`;
    }

    const consulta = `
      INSERT INTO posts_productos 
      (articulos, descripcion, categoria, precio, disponibilidad, propietario_ID, fecha_publicacion, img_url) 
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7)
      RETURNING *;
    `;

    const values = [
      titulo,
      descripcion,
      categoria,
      Number(precio),
      true,
      propietario_ID,
      img_url,
    ];
    const { rows } = await pool.query(consulta, values);

    res.status(201).json({
      mensaje: "Producto publicado exitosamente",
      producto: rows[0],
    });
  } catch (error) {
    console.error("Error al publicar:", error);
    res.status(500).json({ error: "Error al publicar el producto" });
  }
};

module.exports = {
  modificarUsuario,
  agregarPublicacion,
  registrarUsuario,
  loginUsuario,
};
