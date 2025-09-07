import { Router } from "express";
import { CountryController } from "../controllers/CountryController";
import { CountryService } from "../../../application/services/CountryService";
import { GetAllCountriesUseCase } from "../../../application/usecases/GetAllCountriesUseCase";
import { CountryRepositoryMSSQL } from "../../../infra/db/mssql/CountryRepositoryMSSQL";

const repo = new CountryRepositoryMSSQL();
const useCase = new GetAllCountriesUseCase(repo);
const service = new CountryService(useCase);
const controller = new CountryController(service);

const router = Router();
router.get("/countries", controller.getAllCountries.bind(controller));

export default router;