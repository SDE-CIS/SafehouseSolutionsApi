import express from "express";
import path from "path";
import fs from "fs";
import { BlobServiceClient } from "@azure/storage-blob";
import { generateVideoThumbnail } from "../utils/generateVideoThumbnail.js";

const router = express.Router();

const AZURE_BLOB_URL = process.env.AZURE_BLOB_URL;
const AZURE_SAS_TOKEN = process.env.AZURE_SAS_TOKEN;
const AZURE_CONTAINER = "videos";

const blobService = new BlobServiceClient(`${AZURE_BLOB_URL}?${AZURE_SAS_TOKEN}`);
const containerClient = blobService.getContainerClient(AZURE_CONTAINER);

const THUMB_DIR = path.join(process.cwd(), "temp", "thumbs");
const PLACEHOLDER = path.join("public", "images", "thumbnail-placeholder.jpg");

router.get("/", async (req, res) => {
    try {
        const baseUrl = process.env.API_BASE_URL || "http://localhost:4000";

        const videoBlobs = [];
        for await (const blob of containerClient.listBlobsFlat()) {
            videoBlobs.push(blob);
        }

        const videos = await Promise.all(
            videoBlobs.map(async (blob) => {
                const name = blob.name;
                const thumbFile = `${path.parse(name).name}.jpg`;

                const thumbPath = path.join(THUMB_DIR, thumbFile);
                const thumbExists = fs.existsSync(thumbPath);

                if (!thumbExists) {
                    await generateVideoThumbnail(name);
                }

                const thumbnailUrl = fs.existsSync(thumbPath)
                    ? `${baseUrl}/videos/thumbnail/${thumbFile}`
                    : `${baseUrl}/public/images/thumbnail-placeholder.jpg`;

                return {
                    name,
                    url: `${baseUrl}/videos/stream/${encodeURIComponent(name)}`,
                    thumbnail: thumbnailUrl,
                };
            })
        );

        res.status(200).json({ success: true, data: videos });
    } catch (err) {
        console.error("Error listing videos:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get("/thumbnail/:name", async (req, res) => {
    try {
        const { name } = req.params;
        const thumbPath = path.join(THUMB_DIR, name);

        if (!fs.existsSync(thumbPath)) {
            return res.status(404).send("Thumbnail not found");
        }

        res.sendFile(thumbPath);
    } catch (err) {
        console.error("Thumbnail error:", err.message);
        res.status(500).send("Error fetching thumbnail");
    }
});

export default router;