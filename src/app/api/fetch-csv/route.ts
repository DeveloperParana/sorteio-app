import { NextRequest, NextResponse } from "next/server";
import { isGoogleSheetsUrl, toExportUrl } from "@/lib/sheets-url";

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || !isGoogleSheetsUrl(url)) {
      return NextResponse.json(
        { error: "URL inválida. Use uma URL do Google Sheets." },
        { status: 400 }
      );
    }

    const exportUrl = toExportUrl(url);
    const response = await fetch(exportUrl, { next: { revalidate: 0 } });

    if (!response.ok) {
      return NextResponse.json(
        {
          error:
            "Não foi possível acessar a planilha. Verifique se ela está publicada na web.",
        },
        { status: 400 }
      );
    }

    const csvText = await response.text();
    return NextResponse.json({ csv: csvText });
  } catch {
    return NextResponse.json(
      { error: "Erro ao buscar planilha." },
      { status: 500 }
    );
  }
}
