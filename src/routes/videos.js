import express from "express";
import { listVideos, getVideoByName } from "../controllers/videoController.js";

const router = express.Router();

router.get("/", listVideos);
router.get("/:name", getVideoByName);

export default router;
