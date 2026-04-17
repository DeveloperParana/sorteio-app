import { parseCSVText } from "@/lib/csv-parser";

describe("parseCSVText", () => {
  it("parses CSV with headers", () => {
    const csv = "nome,email\nJoão,joao@test.com\nMaria,maria@test.com";
    const result = parseCSVText(csv);
    expect(result.headers).toEqual(["nome", "email"]);
    expect(result.data).toHaveLength(2);
    expect(result.data[0]).toEqual({ nome: "João", email: "joao@test.com" });
    expect(result.data[1]).toEqual({ nome: "Maria", email: "maria@test.com" });
    expect(result.errors).toHaveLength(0);
  });

  it("trims header whitespace", () => {
    const csv = " nome , email \nJoão,joao@test.com";
    const result = parseCSVText(csv);
    expect(result.headers).toEqual(["nome", "email"]);
  });

  it("skips empty lines", () => {
    const csv = "nome,email\nJoão,joao@test.com\n\n\nMaria,maria@test.com\n";
    const result = parseCSVText(csv);
    expect(result.data).toHaveLength(2);
  });

  it("handles semicolon delimiter", () => {
    const csv = "nome;email\nJoão;joao@test.com";
    const result = parseCSVText(csv);
    expect(result.headers).toEqual(["nome", "email"]);
    expect(result.data[0]).toEqual({ nome: "João", email: "joao@test.com" });
  });

  it("returns empty data for empty CSV", () => {
    const csv = "";
    const result = parseCSVText(csv);
    expect(result.data).toHaveLength(0);
  });
});
