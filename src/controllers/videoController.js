import path from "path";
import { BlobServiceClient } from "@azure/storage-blob";

const AZURE_BLOB_URL = process.env.AZURE_BLOB_URL;
const AZURE_SAS_TOKEN = process.env.AZURE_SAS_TOKEN;
const AZURE_CONTAINER = "videos";

const blobService = new BlobServiceClient(`${AZURE_BLOB_URL}?${AZURE_SAS_TOKEN}`);
const containerClient = blobService.getContainerClient(AZURE_CONTAINER);

const baseUrl = process.env.API_BASE_URL || "http://localhost:4000";

export const listVideos = async (req, res) => {
    const videos = await Promise.all(videoBlobs.map(async (blob) => {
        const thumbFile = `${path.parse(blob.name).name}.jpg`;
        const thumbPath = path.join("temp", "thumbs", thumbFile);

        const thumbnail = fs.existsSync(thumbPath)
            ? `${baseUrl}/videos/thumbnail/${thumbFile}`
            : `${baseUrl}/public/images/thumbnail-placeholder.jpg`;

        return {
            name: blob.name,
            url: blob.url,
            thumbnail,
        };
    }));

    res.status(200).json({ success: true, data: videos });
};

export const getThumbnail = async (req, res) => {
    try {
        const thumbPath = path.join(process.cwd(), "temp", "thumbs", req.params.name);
        if (!fs.existsSync(thumbPath)) return res.status(404).send("Thumbnail not found.");
        res.sendFile(thumbPath);
    } catch (error) {
        res.status(500).send(error.message);
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
