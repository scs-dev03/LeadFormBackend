import PdfPrinter from "pdfmake";
import { IPdfService, BuildPdfMeta } from "../../domain/repositories/IpdfService";
import { DealerApiResponse } from "../../domain/entities/Mail";
import path from "path";

// Load virtual fonts (vfs) from pdfmake
const vfsFonts = require("pdfmake/build/vfs_fonts.js");

// Define fonts — names must match keys in vfsFonts
const fonts = {
    Roboto: {
        normal: path.join(__dirname, "fonts/Roboto-Regular.ttf"),
        bold: path.join(__dirname, "fonts/Roboto-Medium.ttf"),
        italics: path.join(__dirname, "fonts/Roboto-Italic.ttf"),
        bolditalics: path.join(__dirname, "fonts/Roboto-MediumItalic.ttf"),
    },
};

// Create a single printer instance with vfsFonts
const printer: any = new PdfPrinter(fonts);
printer.vfs = vfsFonts;

// ---- Utility: chunk array into groups ----
function chunkArray<T>(arr: T[], size: number): T[][] {
    const result: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
        result.push(arr.slice(i, i + size));
    }
    return result;
}

function getMediaLabel(url: string): string {
    const lower = url.toLowerCase();
    if (lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".gif")) {
        return "Photo";
    }
    if (lower.endsWith(".mp4") || lower.endsWith(".mov") || lower.endsWith(".avi")) {
        return "Video";
    }
    if (lower.endsWith(".pdf")) {
        return "PDF";
    }
    if (lower.endsWith(".xlsx") || lower.endsWith(".xls") || lower.endsWith(".csv")) {
        return "Excel";
    }
    return "File"; // fallback for unknown types
}

export class PdfMakePdfService implements IPdfService {
    async buildDealerPdfBuffer(
        data: DealerApiResponse,
        meta: BuildPdfMeta = {}
    ): Promise<{ filename: string; buffer: Buffer }> {
        const { dealerDetails, locationDetails, contacts } = data;
        const dealerName = dealerDetails.dealerName.toUpperCase();
        const brand = dealerDetails.brand.name.toUpperCase();

        // ---- Build Media File tables (5 locations per table) ----
        const mediaTables = chunkArray(locationDetails, 5).map((group) => {
            const headers = group.map((loc) => ({
                text: loc.locationName || "—",
                bold: true,
                alignment: "center",
                fillColor: '#e0e0e0'
            }));

            const maxRows = Math.max(...group.map((loc) => loc.mediaFiles?.length ?? 0));

            const rows: any = [];
            for (let i = 0; i < maxRows; i++) {
                rows.push(
                    group.map((loc) => {
                        const file = loc.mediaFiles?.[i];
                        return file
                            ? {
                                text: getMediaLabel(file.url),
                                link: file.url,
                                color: "blue",
                                decoration: "underline",
                                alignment: "center"
                            }
                            : { text: "—", alignment: "center" };

                    })
                );
            }

            return {
                layout: {
                    hLineWidth: () => 0.5,
                    vLineWidth: () => 0.5,
                    hLineColor: () => "#aaa",
                    vLineColor: () => "#aaa"
                },
                table: {
                    widths: Array(group.length).fill("*"),
                    body: [headers, ...rows],
                },
                margin: [0, 0, 0, 10],
            };
        });
        const docDefinition: any = {
            background: (currentPage: number) => {
                return {
                    image: path.join(__dirname, "sparecare-Unit.png"), // your logo file
                    width: 400,   // make it large
                    opacity: 0.1, // light transparency for watermark effect
                    absolutePosition: { x: 100, y: 200 }, // position on page
                };
            },
            pageMargins: [40, 60, 40, 40],
            header: {
                columns: [
                    {
                        image: path.join(__dirname, "2.png"), // <-- replace with your logo path
                        width: 80,
                        alignment: "left",
                    },
                    {
                        text: `Auto Generated: ${new Date(meta.generatedAt ?? new Date()).toLocaleString()}`,
                        alignment: "right",
                        fontSize: 8,
                        margin: [0, 15, 0, 0],
                    },
                ],
                margin: [40, 20, 40, 0],
            },
            footer: (currentPage: number, pageCount: number) => ({
                margin: [40, 10, 40, 20],
                columns: [
                    {
                        width: '*',
                        text: 'Sparecare Solutions Pvt. Ltd.\nJMD Pacific Square Sector 15 Part 2 Gurugram, Haryana',
                        fontSize: 8,
                        alignment: 'left'
                    },
                    {
                        width: 'auto',
                        text: `Page ${currentPage} of ${pageCount}`,
                        fontSize: 6,
                        alignment: 'center'
                    },
                    {
                        width: '*',
                        text: [
                            { text: 'www.sparecare.in\n', link: 'https://www.sparecare.in', color: 'blue', decoration: 'underline' },
                            { text: `IP: ${meta.ip}` }
                        ],
                        fontSize: 8,
                        alignment: 'right'
                    }
                ],
            }),
            content: [
                { text: `${dealerName} - ${brand}`, style: "title", alignment: "center", bold: true, fontsize: 20 },
                { text: "General Information", style: "subheader", bold: true, fontsize: 15 },
                {
                    layout: {
                        hLineWidth: function () { return 0.5; },  // horizontal line
                        vLineWidth: function () { return 0.5; },  // vertical line
                        hLineColor: function () { return '#aaa'; },
                        vLineColor: function () { return '#aaa'; }
                    },
                    table: {
                        widths: ["25%", "*", "25%", "*"],
                        body: [
                            [
                                { text: "Dealer Name", bold: true, fillColor: '#e0e0e0' },
                                dealerDetails.dealerName
                            ],
                            [
                                { text: "Industry", bold: true, fillColor: '#e0e0e0' },
                                dealerDetails.industry.name
                            ],
                            [
                                { text: "Segments", bold: true, fillColor: '#e0e0e0' },
                                dealerDetails.segment.name
                            ],
                            [
                                { text: "Business Type", bold: true, fillColor: '#e0e0e0' },
                                dealerDetails.businessType.name
                            ],
                            [
                                { text: "Brand", bold: true, fillColor: '#e0e0e0' },
                                dealerDetails.brand.name
                            ],
                            [
                                { text: "Dealer Stock", bold: true, fillColor: '#e0e0e0' },
                                dealerDetails.stock
                                    ? { text: getMediaLabel(dealerDetails.stock), link: dealerDetails.stock, color: "blue", decoration: 'underline' }
                                    : "—",
                            ],
                        ],
                    },
                },
                { text: "Spokesperson Details", style: "subheader", bold: true, fontsize: 15 },
                {
                    layout: {
                        hLineWidth: function () { return 0.5; },  // horizontal line
                        vLineWidth: function () { return 0.5; },  // vertical line
                        hLineColor: function () { return '#aaa'; },
                        vLineColor: function () { return '#aaa'; }
                    },
                    table: {
                        widths: ["30%", "70%"],
                        body: [
                            [{ text: "Name", bold: true, fillColor: '#e0e0e0' }, dealerDetails.spokesperson.name || "—"],
                            [{ text: "Email", bold: true, fillColor: '#e0e0e0' }, dealerDetails.spokesperson.email || "—"],
                            [{ text: "Phone", bold: true, fillColor: '#e0e0e0' }, dealerDetails.spokesperson.phone || "—"],
                        ],
                    },
                },
                { text: "Location Details", style: "subheader", bold: true, fontsize: 15 },
                {
                    layout: {
                        hLineWidth: function () { return 0.5; },  // horizontal line
                        vLineWidth: function () { return 0.5; },  // vertical line
                        hLineColor: function () { return '#aaa'; },
                        vLineColor: function () { return '#aaa'; }
                    },
                    table: {
                        widths: ["14%", "13%", "13%", "10%", "10%", "15%", "15%", "10%"],
                        body: [
                            [
                                { text: "Location name", bold: true, fillColor: '#e0e0e0' },
                                { text: "Location Type", bold: true, fillColor: '#e0e0e0' },
                                { text: "Audit Categories", bold: true, fillColor: '#e0e0e0' },
                                { text: "Pincode", bold: true, fillColor: '#e0e0e0' },
                                { text: "City", bold: true, fillColor: '#e0e0e0' },
                                { text: "State", bold: true, fillColor: '#e0e0e0' },
                                { text: "Remark", bold: true, fillColor: '#e0e0e0' },
                                {
                                    text: "Stock File",
                                    bold: true,
                                    link: "Stock File",
                                    fillColor: '#e0e0e0'
                                },
                            ],
                            ...locationDetails.map((l) => [
                                l.locationName || "—",
                                l.locationType.name || "—",
                                l.auditCategory.name || "—",
                                l.pinCode || "—",
                                l.city || "—",
                                l.state || "—",
                                l.remark || "—",
                                l.stock
                                    ? { text: getMediaLabel(l.stock), link: l.stock, color: "blue", decoration: 'underline' }
                                    : "—",
                            ]),
                        ],
                    },
                },
                {
                    text: "Stock Details",
                    style: "subheader",
                    bold: true,
                    fontSize: 15,
                },
                {
                    layout: {
                        hLineWidth: function () { return 0.5; },
                        vLineWidth: function () { return 0.5; },
                        hLineColor: function () { return "#aaa"; },
                        vLineColor: function () { return "#aaa"; },
                    },
                    table: {
                        widths: ["25%", "25%", "25%", "25%"],
                        body: [
                            // header row
                            [
                                { text: "Location Name", bold: true, fillColor: "#e0e0e0" },
                                { text: "Part Line", bold: true, fillColor: "#e0e0e0" },
                                { text: "Quantity", bold: true, fillColor: "#e0e0e0" },
                                { text: "Value", bold: true, fillColor: "#e0e0e0" },
                            ],
                            // data rows
                            ...locationDetails
                                .filter((l) => !(dealerDetails.stock || l.stock)) // skip if stock file exists
                                .map((l) => [
                                    l.locationName || "—",
                                    l.partline || "—",
                                    l.quantity || "—",
                                    l.value || "—",
                                ]),
                        ],
                    },
                },


                { text: "Contacts", style: "subheader", bold: true, fontsize: 15 },
                {
                    layout: {
                        hLineWidth: function () { return 0.5; },  // horizontal line
                        vLineWidth: function () { return 0.5; },  // vertical line
                        hLineColor: function () { return '#aaa'; },
                        vLineColor: function () { return '#aaa'; }
                    },
                    table: {
                        widths: ["30%", "20%", "25%", "25%"],
                        body: [
                            [
                                { text: "Name (Designation)", bold: true, fillColor: '#e0e0e0' },
                                { text: "Phone", bold: true, fillColor: '#e0e0e0' },
                                { text: "Email", bold: true, fillColor: '#e0e0e0' },
                                { text: "Location", bold: true, fillColor: '#e0e0e0' },
                            ],
                            ...contacts.map((c) => [
                                `${c.name} (${c.designation})`,
                                c.phone || "—",
                                c.email || "—",
                                c.locationName || "—",
                            ]),
                        ],
                    },
                },

                { text: "Media Files", style: "subheader" },
                ...mediaTables,
            ],
            styles: {
                headerLeft: { fontSize: 10, bold: true },
                title: { fontSize: 16, bold: true, margin: [0, 0, 0, 8] },
                subheader: { fontSize: 13, bold: true, margin: [0, 10, 0, 6] },
                locHeader: { fontSize: 12, bold: true, margin: [0, 6, 0, 6] },
                infoTable: { margin: [0, 0, 0, 6] },
            },
            defaultStyle: { font: "Roboto", fontSize: 10 },
        };

        // Use the single printer instance
        const pdfDoc = printer.createPdfKitDocument(docDefinition);

        const chunks: Buffer[] = [];
        return new Promise((resolve, reject) => {
            pdfDoc.on("data", (chunk: Buffer) => chunks.push(chunk));
            pdfDoc.on("end", () => {
                const buffer = Buffer.concat(chunks);
                resolve({ filename: `Lead_Form_Onbaording_${dealerDetails.dealerName}.pdf`, buffer });
            });
            pdfDoc.on("error", reject);
            pdfDoc.end();
        });
    }
}
