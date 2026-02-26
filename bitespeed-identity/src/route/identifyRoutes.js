import express from "express";
import { identifyContact } from "../controller/identifyController.js";

const router = express.Router();

router.post("/" , identifyContact);

export default router;