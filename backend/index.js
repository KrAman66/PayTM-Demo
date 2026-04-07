import express from "express";
const app = express();
import rootRouter from "./routes/index.js";
import cors from "cors";
const port = 3000;

app.use(cors());
app.use(express.json());

app.use("/api/v1", rootRouter);

app.listen(port);
