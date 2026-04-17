"use client";

import { useState } from "react";
import Image from "next/image";
import { LandingPage } from "@/components/LandingPage";
import { Wizard } from "@/components/Wizard";
import { StepImport } from "@/components/StepImport";
import { StepSelectFields } from "@/components/StepSelectFields";
import { StepPrizes } from "@/components/StepPrizes";
import { StepRaffle } from "@/components/StepRaffle";
import { usePersistedState, clearPersistedState } from "@/lib/use-persisted-state";
import type { Participant, Prize } from "@/lib/types";

export default function Home() {
  const [started, setStarted] = usePersistedState("started", false);
  const [step, setStep] = usePersistedState<1 | 2 | 3 | 4>("step", 1);
  const [headers, setHeaders] = usePersistedState<string[]>("headers", []);
  const [rawData, setRawData] = usePersistedState<Record<string, string>[]>("rawData", []);
  const [selectedFields, setSelectedFields] = usePersistedState<string[]>("selectedFields", []);
  const [participants, setParticipants] = usePersistedState<Participant[]>("participants", []);
  const [prizes, setPrizes] = usePersistedState<Prize[]>("prizes", []);
  const [mounted, setMounted] = useState(false);

  // Wait for hydration to avoid flash
  if (!mounted) {
    // Use a timeout-free approach: render nothing on first frame, then mount
    if (typeof window !== "undefined") {
      setTimeout(() => setMounted(true), 0);
    }
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <Image src="/devparana.svg" alt="DevParaná" width={80} height={80} className="animate-pulse" />
      </div>
    );
  }

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

  const handleNewRaffle = () => {
    clearPersistedState();
    setStarted(false);
    setStep(1);
    setHeaders([]);
    setRawData([]);
    setSelectedFields([]);
    setParticipants([]);
    setPrizes([]);
  };

  if (!started) {
    return <LandingPage onStart={() => setStarted(true)} />;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-center gap-3 mb-8">
          <Image src="/devparana.svg" alt="DevParaná" width={48} height={48} />
          <h1 className="text-3xl font-bold text-green-900">
            Dev Paraná — Sorteio
          </h1>
        </div>
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
              onNewRaffle={handleNewRaffle}
            />
          )}
        </Wizard>
      </div>
    </main>
  );
}
