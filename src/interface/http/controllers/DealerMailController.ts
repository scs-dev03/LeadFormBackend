import { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { DealerRepositoryMSSQL } from "../../../infra/db/mssql/DealerRepositoryMSSQL";
import { PdfMakePdfService } from "../../../application/services/PdfMakePdfService";
import { NodemailerMailService } from "../../../application/services/NodemailerMailService";
import { BuildDealerPdf } from "../../../application/usecases/BuildDealerPdf";
import { SendOnboardingMail } from "../../../application/services/SendOnboardingMail";
import { GetUserEmailById } from "../../../infra/db/mssql/UserMailRepositoryMSSQL";
import { UserMailSent } from "../../../infra/db/mssql/UserMailSentRepositoryMSSQL";
import { MarkFinalMailSent } from "../../../application/usecases/MarkFinalMailSent";
import { MailOptionsBuilder } from "../../../shared/Mail";
import { poolPromise } from "../../../infra/db/mssql/connection";

const repo = new DealerRepositoryMSSQL();
const pdfService = new PdfMakePdfService();
const mailService = new NodemailerMailService();
const userMailSentRepo = new UserMailSent();

function getClientIp(req: Request): string {
    const forwarded = req.headers["x-forwarded-for"];
    if (typeof forwarded === "string") {
        return forwarded.split(",")[0].trim(); // first IP in the list
    }
    return req.socket.remoteAddress?.replace("::ffff:", "") || "unknown";
}

export class DealerMailController {
    static async sendOnboardingMail(req: Request, res: Response) {
        const pool = await poolPromise;
        try {
            const { userId} = req.body;

            if (!userId) {
                return res.status(400).json({ error: "userId and brandId are required" });
            }
            const mappingTable = await repo.getBrandIdsByUserId(Number(userId));
            // const dealerIdArray = await repo.getDealerIdsByUserId(Number(userId));
            if (mappingTable.length === 0) {
                return res.status(404).json({ error: "No brands OR dealer found for the user" });
            }
            const userRepo = new GetUserEmailById(pool);
            const to = await userRepo.getEmailById(Number(userId));
            if (!to) {
                return res.status(404).json({ error: "User email not found" });
            }

            const cc = "ujjwal.jain@sparecare.in";
            // 1. Generate PDF
            const buildPdf = new BuildDealerPdf(repo, pdfService);
            const ip: any = getClientIp(req);
            // console.log("Request IP:", ip);
            const attachments: { filename: string; buffer: Buffer }[] = [];//array of objects with filename and content(buffer)
            for (const obj of mappingTable) {
                const result = await buildPdf.execute({
                    userId: Number(userId),
                    dealerId:Number(obj.dealerId),
                    brandId: Number(obj.brandId),
                    ip: ip,
                });
                if(result===null)continue
                const { filename, buffer }=result
                console.log("Generated PDF:", filename);
                const uploadsDir = path.join(__dirname, "../../uploads");
                if (!fs.existsSync(uploadsDir)) {
                    fs.mkdirSync(uploadsDir, { recursive: true });
                }
                const filePath = path.join(uploadsDir, filename);
                fs.writeFileSync(filePath, buffer);
                attachments.push({ filename, buffer: buffer });
            }
            //   const { filename, buffer } = await buildPdf.execute({
            //     userId: Number(userId),
            //     brandId: Number(brandId),
            //     ip:ip,
            //   });

            // 2. Save PDF locally in uploads folder
            //   const uploadsDir = path.join(__dirname, "../../uploads");
            //   if (!fs.existsSync(uploadsDir)) {
            //     fs.mkdirSync(uploadsDir, { recursive: true });
            //   }
            //   const filePath = path.join(uploadsDir, filename);
            //   fs.writeFileSync(filePath, buffer);
            // console.log("PDF saved at:", filePath);

            // 3. Mail sending code commented out for now
            //   const userMailOptions = MailOptionsBuilder.buildMailOptions(
            //     "user",
            //     to,
            //     filename,
            //     buffer,
            //     cc
            //   );

            //   const adminMailOptions = MailOptionsBuilder.buildMailOptions(
            //     "admin",
            //     "vishu.bansal@sparecare.in",
            //     filename,
            //     buffer
            //   );

            // const userMailOptions = MailOptionsBuilder.buildMailOptions(
            //     "user",
            //     to,
            //     attachments,
            //     cc
            // );

            // const adminMailOptions = MailOptionsBuilder.buildMailOptions(
            //     "admin",
            //     "vishu.bansal@sparecare.in",
            //     attachments
            // );

            // const sendMail = new SendOnboardingMail(mailService);
            // await sendMail.execute(userMailOptions);
            // await sendMail.execute(adminMailOptions);

            const userMailOptions = MailOptionsBuilder.buildMailOptions(
                "user",
                to,
                attachments,
                cc
            );

            const adminMailOptions = MailOptionsBuilder.buildMailOptions(
                "admin",
                "vishu.bansal@sparecare.in",
                attachments
            );

            const sendMail = new SendOnboardingMail(mailService);
            await sendMail.execute(userMailOptions);
            await sendMail.execute(adminMailOptions);

            const markFinalMailSent = new MarkFinalMailSent(userMailSentRepo);
            await markFinalMailSent.execute(Number(userId));
            res.status(200).json({
                message: `PDF generated and saved successfully and Oboarding mail sent to ${to} and cc to ${cc} and marked final mail sent in DB`
            });
        } catch (err: any) {
            // console.error("sendOnboardingMail error:", err);
            res.status(500).json({ error: err.message || "Failed to generate PDF" });
        }
    }
}


