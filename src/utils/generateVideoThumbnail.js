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
        fs.mkdirSync(thumbDir, { recursive: true });

        const thumbnailPath = path.join(thumbDir, `${path.parse(videoName).name}.jpg`);
        const placeholderPath = path.join("public", "images", "thumbnail-placeholder.jpg");

        if (fs.existsSync(thumbnailPath)) {
            return thumbnailPath;
        }

        const blobUrl =
            `${AZURE_BLOB_URL}/${AZURE_CONTAINER}/${encodeURIComponent(videoName)}?${AZURE_SAS_TOKEN}`;

        await new Promise((resolve, reject) => {
            ffmpeg(blobUrl)
                .on("start", () => console.log(`FFmpeg remote-read for ${videoName}`))
                .on("error", reject)
                .on("end", resolve)
                .screenshots({
                    timestamps: ["00:00:00.5"],
                    filename: path.basename(thumbnailPath),
                    folder: thumbDir,
                    size: "640x?",
                });
        });

        return fs.existsSync(thumbnailPath) ? thumbnailPath : placeholderPath;

    } catch (err) {
        console.warn(`Error processing ${videoName}: ${err.message}`);
        return path.join("public", "images", "thumbnail-placeholder.jpg");
    }
}
