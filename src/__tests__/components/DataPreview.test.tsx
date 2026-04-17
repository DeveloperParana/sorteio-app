import { render, screen } from "@testing-library/react";
import { DataPreview } from "@/components/DataPreview";

describe("DataPreview", () => {
  const headers = ["nome", "email", "cidade"];
  const data = [
    { nome: "João", email: "joao@test.com", cidade: "Curitiba" },
    { nome: "Maria", email: "maria@test.com", cidade: "Londrina" },
    { nome: "Pedro", email: "pedro@test.com", cidade: "Maringá" },
  ];

  it("renders table headers", () => {
    render(<DataPreview headers={headers} data={data} />);
    expect(screen.getByText("nome")).toBeInTheDocument();
    expect(screen.getByText("email")).toBeInTheDocument();
    expect(screen.getByText("cidade")).toBeInTheDocument();
  });

  it("renders data rows", () => {
    render(<DataPreview headers={headers} data={data} />);
    expect(screen.getByText("João")).toBeInTheDocument();
    expect(screen.getByText("maria@test.com")).toBeInTheDocument();
    expect(screen.getByText("Maringá")).toBeInTheDocument();
  });

  it("limits rows to maxRows", () => {
    const manyRows = Array.from({ length: 10 }, (_, i) => ({
      nome: `User ${i}`,
      email: `user${i}@test.com`,
      cidade: "Curitiba",
    }));
    render(<DataPreview headers={headers} data={manyRows} maxRows={3} />);
    expect(screen.getByText("User 0")).toBeInTheDocument();
    expect(screen.getByText("User 2")).toBeInTheDocument();
    expect(screen.queryByText("User 3")).not.toBeInTheDocument();
    expect(screen.getByText(/Mostrando 3 de 10 linhas/)).toBeInTheDocument();
  });

  it("renders nothing when headers are empty", () => {
    const { container } = render(<DataPreview headers={[]} data={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("shows dash for missing values", () => {
    const incompleteData = [{ nome: "João", email: "", cidade: "" }];
    render(<DataPreview headers={headers} data={incompleteData} />);
    const dashes = screen.getAllByText("—");
    expect(dashes.length).toBe(2);
  });
});
