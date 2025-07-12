const request = require("supertest");
const app = require("../index");

describe("API /auth", () => {
    test("POST /auth/registrar", async () => {
    const res = await request(app).post("/api/auth/registrar").send({
        email: "test@correo.com",
        password: "123456",
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
    });

    test("POST /auth/login", async () => {
    const res = await request(app).post("/api/auth/login").send({
        email: "test@correo.com",
        password: "123456",
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
    });
});

describe("API /cards", () => {
    test("GET /cards", async () => {
    const res = await request(app).get("/api/cards");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    });
});
