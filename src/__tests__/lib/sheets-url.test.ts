import { isGoogleSheetsUrl, toExportUrl } from "@/lib/sheets-url";

describe("isGoogleSheetsUrl", () => {
  it("accepts valid Google Sheets URLs", () => {
    expect(isGoogleSheetsUrl("https://docs.google.com/spreadsheets/d/abc123/edit")).toBe(true);
  });

  it("rejects non-Sheets URLs", () => {
    expect(isGoogleSheetsUrl("https://example.com")).toBe(false);
    expect(isGoogleSheetsUrl("not a url")).toBe(false);
  });
});

describe("toExportUrl", () => {
  it("converts edit URL to CSV export URL", () => {
    const url = "https://docs.google.com/spreadsheets/d/abc123/edit#gid=0";
    const result = toExportUrl(url);
    expect(result).toBe("https://docs.google.com/spreadsheets/d/abc123/export?format=csv&gid=0");
  });

  it("defaults to gid=0 when not specified", () => {
    const url = "https://docs.google.com/spreadsheets/d/abc123/edit";
    const result = toExportUrl(url);
    expect(result).toContain("gid=0");
  });

  it("throws on invalid URL", () => {
    expect(() => toExportUrl("https://example.com")).toThrow();
  });
});
