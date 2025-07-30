const request = require("supertest");
const app = require("../index");

let token;
let articuloId;

describe("API /auth", () => {
    test("POST /auth/usuarios", async () => {
    const res = await request(app)
        .post("/api/auth/usuarios")
        .field("nombre", "Test User")
        .field("email", "test@correo.com")
        .field("password", "123456")
        .field("direccion", "Calle Falsa 123")
        .field("telefono", "12345678")
        .attach("img", Buffer.from("img falsa"), "test.jpg");

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("id");
});

    test("POST /auth/login", async () => {
        const res = await request(app)
        .post("/api/auth/login")
        .send({
            email: "test@correo.com",
            password: "123456",
        });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
    token = res.body.token;
});

test("POST /api/cards/articulos", async () => {
        const res = await request(app)
        .post("/api/cards/articulos")
        .set("Authorization", `Bearer ${token}`)
        .field("articulos", "Pelota para perro")
        .field("descripcion", "Pelota divertida y segura")
        .field("precio", 9990)
        .field("disponibilidad", true)
        .attach("img", Buffer.from("img falsa"), "test.jpg");

    expect(res.statusCode).toBe(201); 
    expect(res.body).toHaveProperty("producto");
    articuloId = res.body.producto.id;
    });

    test("GET /api/cards/favoritos", async () => {
        const res = await request(app)
        .post("/api/cards/favoritos")
        .set("Authorization", `Bearer ${token}`)
        .send({ articulo_ID: articuloId });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("mensaje");
    }); 

    test("GET /api/cards/getfavoritos", async () => {
        const res = await request(app)
        .get("/api/cards/favoritos")
        .set("Authorization", `Bearer ${token}`);
    
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    });
});