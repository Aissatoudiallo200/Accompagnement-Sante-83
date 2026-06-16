import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import authRoutes from "./routes/authroutes.js";
import appointmentroutes from "./routes/appointmentroutes.js";
import partnerRoutes from "./routes/partnerRoutes.js";
import patientRoutes from "./routes/patientRoutes.js";
import expertRoutes from "./routes/ExpertRoutes.js";
import adminRoutes from "./routes/adminroutes.js";
import resourcesRoutes from "./routes/resourcesRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";


const app = express();


app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use("/api/partners", partnerRoutes);
app.use("/api/experts", partnerRoutes);
app.use((req, res, next) => {
  console.log(req.method, req.url);
  next();
});

app.use("/api/appointments", appointmentroutes);
app.use("/api/patient", patientRoutes);
app.use("/api/expert", expertRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/resources", resourcesRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/api/health", (req, res) => res.json({ ok: true, name: "PAXCARE API" }));

app.use("/api/auth", authRoutes);

const port = process.env.PORT || 4000;
app.listen(port, () => console.log("API running on port", port));
