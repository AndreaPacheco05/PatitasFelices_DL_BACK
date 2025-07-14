CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR,
    correo VARCHAR,
    password VARCHAR,
    direccion VARCHAR,
    telefono INTEGER,
    imgPerfil_url VARCHAR
);


CREATE TABLE posts_productos (
    id SERIAL PRIMARY KEY,
    articulos VARCHAR,
    descripcion TEXT,
    precio INTEGER,
    disponibilidad BOOLEAN,
    propietario_ID INTEGER,
    fecha_publicacion TIMESTAMP,
    img_url VARCHAR,
    FOREIGN KEY (propietario_ID) REFERENCES usuarios(id)
);


CREATE TABLE favoritos (
    ID INTEGER PRIMARY KEY,
    interesado_ID INTEGER,
    articulo_ID INTEGER,
    FOREIGN KEY (interesado_ID) REFERENCES usuarios(ID),
    FOREIGN KEY (articulo_ID) REFERENCES posts_productos(ID)
);

SELECT 
    P.ID AS producto_id,
    P.articulos,
    P.descripcion,
    P.precio
    U.nombre AS propietario
FROM posts_productos P
INNER JOIN usuarios U ON P.propietario_ID = U.ID;

SELECT 
    F.ID AS favorito_id,
    U.nombre AS usuario_interesado,
    P.articulos AS producto_favorito
FROM FAVORITOS F
INNER JOIN usuarios U ON F.interesado_ID = U.ID
INNER JOIN posts_productos P ON F.articulo_ID = P.ID;
