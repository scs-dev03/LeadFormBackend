import express from "express";
import bodyParser from "body-parser";
import authRoutes from "../interface/http/routes/AuthRoutes";
import lookupRoutes from "../interface/http/routes/lookupRoutes";
import dealerRoutes from "../interface/http/routes/dealerRoutes";
import locationRoutes from "../interface/http/routes/locationRoutes";
import auditLookupRoutes from "../interface/http/routes/lookup.routes";
import contactRoutes from "../interface/http/routes/contactRoutes";
import EditDealerRoute from "../interface/http/routes/EditDealerRoute";
import { poolPromise } from "../infra/db/mssql/connection";

const app = express();
app.use(bodyParser.json());

// Routes
app.use("/auth", authRoutes);                  // Auth routes
app.use("/api",auditLookupRoutes);             //for audit, location type lookup
app.use("/api/lookups", lookupRoutes);         // Brand, industry and other lookups
app.use("/api", dealerRoutes);                 // Dealer create and details routes
app.use("/api/addLocationDetails", locationRoutes); // LocationDetails create route
app.use("/api",contactRoutes);
app.use("/api",EditDealerRoute);

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
