import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StepPrizes } from "@/components/StepPrizes";

// Mock crypto.randomUUID
let uuidCounter = 0;
beforeEach(() => {
  uuidCounter = 0;
  jest.spyOn(crypto, "randomUUID").mockImplementation(() => `uuid-${++uuidCounter}`);
});
afterEach(() => jest.restoreAllMocks());

describe("StepPrizes", () => {
  it("starts with empty prize list", () => {
    render(
      <StepPrizes participantCount={10} onPrizesCreated={jest.fn()} onBack={jest.fn()} />
    );
    expect(screen.getByText(/0 prêmios? para 10 participantes/)).toBeInTheDocument();
  });

  it("disables start button when no prizes", () => {
    render(
      <StepPrizes participantCount={10} onPrizesCreated={jest.fn()} onBack={jest.fn()} />
    );
    expect(screen.getByText("Iniciar Sorteio →")).toBeDisabled();
  });

  it("adds a prize", async () => {
    const user = userEvent.setup();
    render(
      <StepPrizes participantCount={10} onPrizesCreated={jest.fn()} onBack={jest.fn()} />
    );
    await user.type(screen.getByPlaceholderText("Nome do prêmio..."), "Camiseta");
    await user.click(screen.getByText("Adicionar"));
    expect(screen.getByText("Camiseta")).toBeInTheDocument();
    expect(screen.getByText(/1 prêmio para 10 participantes/)).toBeInTheDocument();
  });

  it("adds prize on Enter key", async () => {
    const user = userEvent.setup();
    render(
      <StepPrizes participantCount={10} onPrizesCreated={jest.fn()} onBack={jest.fn()} />
    );
    const input = screen.getByPlaceholderText("Nome do prêmio...");
    await user.type(input, "Adesivo{enter}");
    expect(screen.getByText("Adesivo")).toBeInTheDocument();
  });

  it("removes a prize", async () => {
    const user = userEvent.setup();
    render(
      <StepPrizes participantCount={10} onPrizesCreated={jest.fn()} onBack={jest.fn()} />
    );
    await user.type(screen.getByPlaceholderText("Nome do prêmio..."), "Camiseta");
    await user.click(screen.getByText("Adicionar"));
    expect(screen.getByText("Camiseta")).toBeInTheDocument();
    await user.click(screen.getByTitle("Remover"));
    expect(screen.queryByText("Camiseta")).not.toBeInTheDocument();
  });

  it("warns when more prizes than participants", async () => {
    const user = userEvent.setup();
    render(
      <StepPrizes participantCount={1} onPrizesCreated={jest.fn()} onBack={jest.fn()} />
    );
    const input = screen.getByPlaceholderText("Nome do prêmio...");
    await user.type(input, "Prize 1{enter}");
    await user.type(input, "Prize 2{enter}");
    expect(screen.getByText(/mais prêmios do que participantes/)).toBeInTheDocument();
  });

  it("calls onPrizesCreated with prize list", async () => {
    const user = userEvent.setup();
    const onPrizesCreated = jest.fn();
    render(
      <StepPrizes participantCount={10} onPrizesCreated={onPrizesCreated} onBack={jest.fn()} />
    );
    const input = screen.getByPlaceholderText("Nome do prêmio...");
    await user.type(input, "Camiseta{enter}");
    await user.type(input, "Adesivo{enter}");
    await user.click(screen.getByText("Iniciar Sorteio →"));
    expect(onPrizesCreated).toHaveBeenCalledWith([
      { id: "uuid-1", name: "Camiseta" },
      { id: "uuid-2", name: "Adesivo" },
    ]);
  });

  it("does not add empty prize", async () => {
    const user = userEvent.setup();
    render(
      <StepPrizes participantCount={10} onPrizesCreated={jest.fn()} onBack={jest.fn()} />
    );
    expect(screen.getByText("Adicionar")).toBeDisabled();
    await user.type(screen.getByPlaceholderText("Nome do prêmio..."), "   ");
    expect(screen.getByText("Adicionar")).toBeDisabled();
  });
});
