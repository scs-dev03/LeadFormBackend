import express from "express";
import bodyParser from "body-parser";
import routes from "../interface/http/routes/index"; 
import { poolPromise } from "../infra/db/mssql/connection";

const app = express();
app.use(bodyParser.json());

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
