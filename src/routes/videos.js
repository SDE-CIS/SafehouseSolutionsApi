import express from "express";
import { getThumbnail, listVideos, streamVideo } from "../controllers/videoController.js";
const router = express.Router();
router.get("/", listVideos);
router.get("/thumbnail/:name", getThumbnail);
router.get("/stream/:name", streamVideo);
export default router;