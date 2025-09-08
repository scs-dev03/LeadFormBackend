import express from "express";
import bodyParser from "body-parser";
import routes from "./src/interface/http/routes/index"; 
import cors from "cors"; 
import { poolPromise } from "./src/infra/db/mssql/connection";

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({ limit: '200mb', extended: true }));
app.use("/api", routes);

(async () => {
  try {
    await poolPromise;
    console.log("DB connected!");
  } catch (err) {
    console.error("DB connection failed:", err);
  }
})();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
