import { render, screen } from "@testing-library/react";
import { Wizard } from "@/components/Wizard";

describe("Wizard", () => {
  it("renders all step labels", () => {
    render(<Wizard currentStep={1}><div>Content</div></Wizard>);
    expect(screen.getByText("Importar")).toBeInTheDocument();
    expect(screen.getByText("Campos")).toBeInTheDocument();
    expect(screen.getByText("Prêmios")).toBeInTheDocument();
    expect(screen.getByText("Sortear")).toBeInTheDocument();
  });

  it("renders children", () => {
    render(<Wizard currentStep={1}><div>Test Content</div></Wizard>);
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("marks completed steps with checkmark", () => {
    render(<Wizard currentStep={3}><div>Content</div></Wizard>);
    const checkmarks = screen.getAllByText("✓");
    expect(checkmarks).toHaveLength(2);
  });

  it("shows step numbers for upcoming steps", () => {
    render(<Wizard currentStep={2}><div>Content</div></Wizard>);
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
  });
});
