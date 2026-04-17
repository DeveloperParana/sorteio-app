"use client";

import { useState } from "react";
import { Wizard } from "@/components/Wizard";
import { StepImport } from "@/components/StepImport";
import { StepSelectFields } from "@/components/StepSelectFields";
import { StepPrizes } from "@/components/StepPrizes";
import { StepRaffle } from "@/components/StepRaffle";
import type { Participant, Prize } from "@/lib/types";

export default function Home() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawData, setRawData] = useState<Record<string, string>[]>([]);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [prizes, setPrizes] = useState<Prize[]>([]);

  const handleDataLoaded = (h: string[], data: Record<string, string>[]) => {
    setHeaders(h);
    setRawData(data);
    setStep(2);
  };

  const handleFieldsSelected = (fields: string[]) => {
    setSelectedFields(fields);
    const filtered = rawData.map((row) => {
      const obj: Record<string, string> = {};
      fields.forEach((f) => {
        obj[f] = row[f];
      });
      return obj;
    });
    setParticipants(filtered);
    setStep(3);
  };

  const handlePrizesCreated = (p: Prize[]) => {
    setPrizes(p);
    setStep(4);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-8 text-indigo-900">
          🎯 Sorteio App
        </h1>
        <Wizard currentStep={step}>
          {step === 1 && <StepImport onDataLoaded={handleDataLoaded} />}
          {step === 2 && (
            <StepSelectFields
              headers={headers}
              data={rawData}
              onFieldsSelected={handleFieldsSelected}
              onBack={() => setStep(1)}
            />
          )}
          {step === 3 && (
            <StepPrizes
              participantCount={participants.length}
              onPrizesCreated={handlePrizesCreated}
              onBack={() => setStep(2)}
            />
          )}
          {step === 4 && (
            <StepRaffle
              participants={participants}
              prizes={prizes}
              displayField={selectedFields[0]}
            />
          )}
        </Wizard>
      </div>
    </main>
  );
}
