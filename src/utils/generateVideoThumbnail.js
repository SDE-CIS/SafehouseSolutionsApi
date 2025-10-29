import ffmpeg from "./ffmpegSetup.js";
import fs from "fs";
import path from "path";
import https from "https";
import fetch from "node-fetch";
import { pipeline } from "stream/promises";
import { BlobServiceClient } from "@azure/storage-blob";

const AZURE_BLOB_URL = process.env.AZURE_BLOB_URL;
const AZURE_SAS_TOKEN = process.env.AZURE_SAS_TOKEN;
const AZURE_CONTAINER = "videos";

const blobService = new BlobServiceClient(`${AZURE_BLOB_URL}?${AZURE_SAS_TOKEN}`);
const containerClient = blobService.getContainerClient(AZURE_CONTAINER);

export async function generateVideoThumbnail(videoName) {
    try {
        const thumbDir = path.join(process.cwd(), "temp", "thumbs");
        const downloadDir = path.join(process.cwd(), "temp", "downloads");
        fs.mkdirSync(thumbDir, { recursive: true });
        fs.mkdirSync(downloadDir, { recursive: true });

        const thumbnailPath = path.join(thumbDir, `${path.parse(videoName).name}.jpg`);
        const placeholderPath = path.join("public", "images", "thumbnail-placeholder.jpg");

        if (fs.existsSync(thumbnailPath)) {
            console.log(`✅ Using cached thumbnail: ${thumbnailPath}`);
            return thumbnailPath;
        }

        const tempFile = path.join(downloadDir, videoName);
        const blobUrl = `${AZURE_BLOB_URL}/${AZURE_CONTAINER}/${encodeURIComponent(videoName)}?${AZURE_SAS_TOKEN}`;

        console.log(`⬇️ Downloading blob via HTTPS: ${videoName}`);

        const response = await fetch(blobUrl, {
            agent: new https.Agent({ rejectUnauthorized: false }),
        });

        if (!response.ok) {
            console.warn(`⚠️ Skipping ${videoName}: Failed to fetch (${response.status})`);
            return placeholderPath;
        }

        await pipeline(response.body, fs.createWriteStream(tempFile));

        const stats = fs.statSync(tempFile);
        if (!stats.size || stats.size < 100 * 1024) {
            console.warn(`⚠️ Skipping ${videoName}: too small (${stats.size} bytes)`);
            fs.unlinkSync(tempFile);
            return placeholderPath;
        }

        console.log(`🎞️ Generating thumbnail for ${videoName}...`);

        await new Promise((resolve) => {
            ffmpeg(tempFile)
                .inputFormat(videoName.endsWith(".avi") ? "avi" : "mp4")
                .on("start", (cmd) => console.log("FFmpeg cmd:", cmd))
                .on("error", (err) => {
                    console.warn(`⚠️ Skipping ${videoName}: ${err.message}`);
                    try {
                        fs.unlinkSync(tempFile);
                    } catch (_) { }
                    resolve();
                })
                .on("end", () => {
                    console.log(`✅ Thumbnail created: ${thumbnailPath}`);
                    try {
                        fs.unlinkSync(tempFile);
                    } catch (_) { }
                    resolve();
                })
                .screenshots({
                    timestamps: ["00:00:00.5"],
                    filename: path.basename(thumbnailPath),
                    folder: thumbDir,
                    size: "640x?",
                });
        });

        return fs.existsSync(thumbnailPath) ? thumbnailPath : placeholderPath;
    } catch (err) {
        console.warn(`⚠️ Error processing ${videoName}: ${err.message}`);
        const placeholderPath = path.join("public", "images", "thumbnail-placeholder.jpg");
        return placeholderPath;
    }
}
