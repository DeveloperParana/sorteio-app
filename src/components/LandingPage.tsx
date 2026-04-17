"use client";

import { useState } from "react";
import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";

interface LandingPageProps {
  onStart: () => void;
}

export function LandingPage({ onStart }: LandingPageProps) {
  const [formsUrl, setFormsUrl] = useState("");

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center space-y-8">
        <div className="flex flex-col items-center gap-4">
          <Image
            src="/devparana.svg"
            alt="DevParaná"
            width={120}
            height={120}
          />
          <h1 className="text-4xl font-bold text-green-900">
            Dev Paraná
          </h1>
          <p className="text-lg text-green-700">Sorteio de Prêmios</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 block text-left">
              Link do formulário de inscrição
            </label>
            <input
              type="url"
              value={formsUrl}
              onChange={(e) => setFormsUrl(e.target.value)}
              placeholder="https://forms.gle/..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
            />
          </div>

          {formsUrl.trim() && (
            <div className="flex flex-col items-center gap-3 py-4">
              <p className="text-sm text-gray-500">
                Escaneie para se inscrever
              </p>
              <div className="bg-white p-4 rounded-xl border-2 border-green-200 shadow-sm">
                <QRCodeSVG
                  value={formsUrl}
                  size={200}
                  fgColor="#15a04b"
                  level="M"
                  imageSettings={{
                    src: "/devparana.svg",
                    height: 40,
                    width: 40,
                    excavate: true,
                  }}
                />
              </div>
              <p className="text-xs text-gray-400 max-w-xs break-all">
                {formsUrl}
              </p>
            </div>
          )}
        </div>

        <button
          onClick={onStart}
          className="px-8 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-bold text-lg shadow-lg hover:shadow-xl"
        >
          🎯 Iniciar Sorteio
        </button>
      </div>
    </div>
  );
}
