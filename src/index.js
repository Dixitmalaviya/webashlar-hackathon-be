import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { connectDB } from "./config/db.js";
import identityRoutes from "./routes/identity.routes.js";
import consentRoutes from "./routes/consent.routes.js";
import recordRoutes from "./routes/record.routes.js";
import incentiveRoutes from "./routes/incentive.routes.js";
import authRoutes from "./routes/auth.routes.js";
import relationshipRoutes from "./routes/relationship.routes.js";
import reportRoutes from "./routes/report.routes.js";
import statusRoutes from "./routes/status.routes.js";
import { errorHandler, notFound } from "./middleware/error.js";

dotenv.config();

const app = express();
app.use(express.json({ limit: "2mb" }));
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

await connectDB();

app.get("/", (req, res) => {
  res.json({ ok: true, service: "healthcare-chain-api" });
});

app.use("/api/identity", identityRoutes);
app.use("/api/consent", consentRoutes);
app.use("/api/records", recordRoutes);
app.use("/api/incentives", incentiveRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/relationships", relationshipRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/status", statusRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => console.log(`API listening on :${PORT}`));
