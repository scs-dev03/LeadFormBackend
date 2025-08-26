import path from "path";
import { S3Client } from "@aws-sdk/client-s3";
import multer from "multer";
// @ts-ignore
import multerS3 from "multer-s3-v3";
import { Request } from "express";

const MAX_SIZE = 150 * 1024 * 1024;

const s3 = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY!,
        secretAccessKey: process.env.AWS_SECRET_KEY!,
    },
});

function fileFilter(req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) {
    const ext = path.extname(file.originalname).toLowerCase();

    if (file.fieldname === "stockFile") {
        if (![".xls", ".xlsx", ".csv"].includes(ext)) {
            return cb(new Error("Only Excel/CSV files allowed for Stock Upload"));
        }
    }

    if (file.fieldname === "media") {
        const allowed = [".jpg", ".jpeg", ".png", ".mp4", ".mov"];
        if (!allowed.includes(ext)) {
            return cb(new Error("Invalid media format. Allowed: jpg, jpeg, png, mp4, mov"));
        }
    }

    if (file.fieldname === "documents") {
        const allowedDocs = [".pdf", ".doc", ".docx"];
        if (!allowedDocs.includes(ext)) {
            return cb(new Error("Only PDF/DOC/DOCX allowed for documents"));
        }
    }

    cb(null, true);
}
export const upload = multer({
    storage: multerS3({
        s3,
        bucket: process.env.S3_BUCKET_NAME!,
        key: (_req: Request, file: Express.Multer.File, cb: any) => {
            cb(null, Date.now().toString() + "_" + file.originalname);
        },
    }),
    limits: { fileSize: MAX_SIZE },
    fileFilter,
});