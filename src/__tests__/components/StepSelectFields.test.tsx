import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StepSelectFields } from "@/components/StepSelectFields";

describe("StepSelectFields", () => {
  const headers = ["nome", "email", "cidade"];
  const data = [
    { nome: "João", email: "joao@test.com", cidade: "Curitiba" },
    { nome: "Maria", email: "maria@test.com", cidade: "Londrina" },
  ];

  it("renders all field buttons", () => {
    render(
      <StepSelectFields
        headers={headers}
        data={data}
        onFieldsSelected={jest.fn()}
        onBack={jest.fn()}
      />
    );
    expect(screen.getByText("nome")).toBeInTheDocument();
    expect(screen.getByText("email")).toBeInTheDocument();
    expect(screen.getByText("cidade")).toBeInTheDocument();
  });

  it("shows participant count", () => {
    render(
      <StepSelectFields
        headers={headers}
        data={data}
        onFieldsSelected={jest.fn()}
        onBack={jest.fn()}
      />
    );
    expect(screen.getByText(/2 participantes carregados/)).toBeInTheDocument();
  });

  it("disables next button when no fields selected", () => {
    render(
      <StepSelectFields
        headers={headers}
        data={data}
        onFieldsSelected={jest.fn()}
        onBack={jest.fn()}
      />
    );
    const nextBtn = screen.getByText("Próximo →");
    expect(nextBtn).toBeDisabled();
  });

  it("enables next button after selecting a field", async () => {
    const user = userEvent.setup();
    render(
      <StepSelectFields
        headers={headers}
        data={data}
        onFieldsSelected={jest.fn()}
        onBack={jest.fn()}
      />
    );
    await user.click(screen.getByText("nome"));
    const nextBtn = screen.getByText("Próximo →");
    expect(nextBtn).not.toBeDisabled();
  });

  it("calls onFieldsSelected with selected fields", async () => {
    const user = userEvent.setup();
    const onFieldsSelected = jest.fn();
    render(
      <StepSelectFields
        headers={headers}
        data={data}
        onFieldsSelected={onFieldsSelected}
        onBack={jest.fn()}
      />
    );
    await user.click(screen.getByText("nome"));
    await user.click(screen.getByText("email"));
    await user.click(screen.getByText("Próximo →"));
    expect(onFieldsSelected).toHaveBeenCalledWith(["nome", "email"]);
  });

  it("calls onBack when back button is clicked", async () => {
    const user = userEvent.setup();
    const onBack = jest.fn();
    render(
      <StepSelectFields
        headers={headers}
        data={data}
        onFieldsSelected={jest.fn()}
        onBack={onBack}
      />
    );
    await user.click(screen.getByText("← Voltar"));
    expect(onBack).toHaveBeenCalled();
  });

  it("toggles field selection on and off", async () => {
    const user = userEvent.setup();
    render(
      <StepSelectFields
        headers={headers}
        data={data}
        onFieldsSelected={jest.fn()}
        onBack={jest.fn()}
      />
    );
    const nomeBtn = screen.getByText("nome");
    await user.click(nomeBtn);
    expect(screen.getByText("✓ nome")).toBeInTheDocument();
    await user.click(screen.getByText("✓ nome"));
    expect(screen.getByText("nome")).toBeInTheDocument();
  });
});
