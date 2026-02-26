import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import identifyRoutes from "./route/identifyRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/identify" , identifyRoutes);

app.listen(PORT , ()=>{
    console.log(`Server is running on port ${PORT}`);
})