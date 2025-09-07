import { poolPromise } from "../../LeadFormBackend/src/infra/db/mssql/connection";
import * as ExcelJS from "exceljs";
import path from "path";

function normalizeCountryCode(value: any): string[] {
  if (!value) return [];

  let str = getCellText(value).trim();

  // Remove spaces (e.g., "672, 64" -> "672,64")
  str = str.replace(/\s+/g, "");

  // Split on commas and prefix with +
  const codes = str.split(",").map((code: any) => `+${code}`);

  return codes;
}

// 🔹 Helper to safely extract text from ExcelJS cells
function getCellText(value: any): string {
  if (value == null) return "";

  if (typeof value === "object") {
    if ("text" in value) return String(value.text);       // Rich text
    if ("result" in value) return String(value.result);   // Formula result
    if ("richText" in value) {
      return value.richText.map((t: any) => t.text).join("");
    }
  }

  return String(value);
}

async function seedCountries() {
  try {
    const pool = await poolPromise;
    const workbook = new ExcelJS.Workbook();

    const filePath = path.join(__dirname, "../Country_Code_List.xlsx");
    await workbook.xlsx.readFile(filePath);

    const sheet = workbook.worksheets[0];

    for (let i = 4; i <= sheet.rowCount; i++) {
  const row = sheet.getRow(i);

  const country = getCellText(row.getCell(1).value).trim();
  if (!country) continue; // skip empty rows

  const isoCode = getCellText(row.getCell(2).value).split("/")[0].trim();
  const rawCode = row.getCell(3).value;
  const countryCodes = normalizeCountryCode(rawCode);

  console.log("Country:", country);
  console.log("IsoCode:", isoCode);
  console.log("CountryCode list:", countryCodes);

  for (const code of countryCodes) {
    await pool
      .request()
      .input("Country", country)
      .input("IsoCode", isoCode)
      .input("CountryCode", code)
      .query(
        `INSERT INTO Countries (Country, IsoCode, CountryCode)
         VALUES (@Country, @IsoCode, @CountryCode)`
      );
  }
}

    console.log("✅ Countries seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding countries:", error);
    process.exit(1);
  }
}

seedCountries();
