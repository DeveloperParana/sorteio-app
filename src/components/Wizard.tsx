interface WizardProps {
  currentStep: 1 | 2 | 3 | 4;
  children: React.ReactNode;
}

const STEP_LABELS = ["Importar", "Campos", "Prêmios", "Sortear"];

export function Wizard({ currentStep, children }: WizardProps) {
  return (
    <div className="space-y-8">
      <nav className="flex items-center justify-center gap-2">
        {STEP_LABELS.map((label, i) => {
          const stepNum = (i + 1) as 1 | 2 | 3 | 4;
          const isActive = stepNum === currentStep;
          const isDone = stepNum < currentStep;

          return (
            <div key={label} className="flex items-center gap-2">
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-indigo-600 text-white"
                    : isDone
                    ? "bg-indigo-100 text-indigo-700"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                <span className="w-5 h-5 flex items-center justify-center rounded-full text-xs bg-white/20">
                  {isDone ? "✓" : stepNum}
                </span>
                {label}
              </div>
              {i < STEP_LABELS.length - 1 && (
                <div
                  className={`w-8 h-0.5 ${
                    isDone ? "bg-indigo-300" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </nav>

      <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
        {children}
      </div>
    </div>
  );
}
