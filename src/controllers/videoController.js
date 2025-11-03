import path from "path";
import fs from "fs";
import { BlobServiceClient } from "@azure/storage-blob";
import { generateVideoThumbnail } from "../utils/generateVideoThumbnail.js";

const AZURE_BLOB_URL = process.env.AZURE_BLOB_URL;
const AZURE_SAS_TOKEN = process.env.AZURE_SAS_TOKEN;
const AZURE_CONTAINER = "videos";

const blobService = new BlobServiceClient(`${AZURE_BLOB_URL}?${AZURE_SAS_TOKEN}`);
const containerClient = blobService.getContainerClient(AZURE_CONTAINER);

const THUMB_DIR = path.join(process.cwd(), "temp", "thumbs");

export const listVideos = async (req, res) => {
    try {
        const baseUrl = `http://${process.env.HOST || "localhost:4000"}`;

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
};

export const getThumbnail = async (req, res) => {
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
};

export const streamVideo = async (req, res) => {
    try {
        const { name } = req.params;
        const blobClient = containerClient.getBlobClient(name);
        const exists = await blobClient.exists();
        if (!exists) return res.status(404).send("Video not found");

        const blobProps = await blobClient.getProperties();
        const contentType = blobProps.contentType || "video/mp4";
        const download = await blobClient.download();

        res.setHeader("Content-Type", contentType);
        res.setHeader("Accept-Ranges", "bytes");
        download.readableStreamBody.pipe(res);
    } catch (error) {
        console.error("Stream error:", error.message);
        res.status(500).send(error.message);
    }
};
