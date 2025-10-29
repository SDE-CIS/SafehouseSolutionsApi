import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);

if (!ffmpegPath || !fs.existsSync(ffmpegPath)) {
    throw new Error("ffmpeg binary missing! Try reinstalling ffmpeg-static");
}

const normalized = path.normalize(ffmpegPath);
ffmpeg.setFfmpegPath(normalized);

export default ffmpeg;
