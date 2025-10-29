import express from "express";
import { listVideos, getVideoByName, streamVideo } from "../controllers/videoController.js";

const router = express.Router();

router.get("/", listVideos);
router.get("/:name", getVideoByName);
router.get("/stream/:name", streamVideo);

export default router;
