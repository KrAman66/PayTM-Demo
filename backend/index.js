import express from "express";
const app = express();
import rootRouter from "./routes/index.js";
import cors from "cors";
const port = process.env.PORT || 3000;

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());

app.use("/api/v1", rootRouter);

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});
