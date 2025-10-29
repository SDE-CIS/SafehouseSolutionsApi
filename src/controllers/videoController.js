import { BlobServiceClient } from "@azure/storage-blob";

const account = process.env.AZURE_STORAGE_ACCOUNT;
const sasToken = process.env.AZURE_SAS_TOKEN;
const containerName = process.env.AZURE_CONTAINER_NAME;

const blobServiceClient = new BlobServiceClient(
    `https://${account}.blob.core.windows.net/?${sasToken}`
);

const containerClient = blobServiceClient.getContainerClient(containerName);

export const listVideos = async (req, res) => {
    try {
        const blobs = [];
        for await (const blob of containerClient.listBlobsFlat()) {
            blobs.push({
                name: blob.name,
                url: `https://${account}.blob.core.windows.net/${containerName}/${blob.name}?${sasToken}`,
            });
        }

        if (blobs.length === 0) {
            return res.status(404).json({ success: false, message: "No videos found" });
        }

        res.status(200).json({ success: true, data: blobs });
    } catch (error) {
        console.error("Error listing videos:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getVideoByName = async (req, res) => {
    try {
        const { name } = req.params;
        const blobClient = containerClient.getBlobClient(name);

        const exists = await blobClient.exists();
        if (!exists) {
            return res.status(404).json({ success: false, message: "Video not found" });
        }

        // streaming the blob back
        const downloadBlockBlobResponse = await blobClient.download();
        res.setHeader("Content-Type", "video/mp4");
        downloadBlockBlobResponse.readableStreamBody.pipe(res);
    } catch (error) {
        console.error("Error fetching video:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const streamVideo = async (req, res) => {
    try {
        const { name } = req.params;

        if (!name) {
            return res.status(400).json({ success: false, message: "Missing video name." });
        }

        const blobClient = containerClient.getBlobClient(name);
        const exists = await blobClient.exists();

        if (!exists) {
            return res.status(404).json({ success: false, message: "Video not found." });
        }

        const props = await blobClient.getProperties();
        const fileSize = props.contentLength;
        const contentType = props.contentType || "video/mp4";

        const range = req.headers.range;

        if (!range) {
            // No range — send the whole video (fallback)
            res.setHeader("Content-Length", fileSize);
            res.setHeader("Content-Type", contentType);
            res.setHeader("Accept-Ranges", "bytes");

            const fullDownload = await blobClient.download();
            return fullDownload.readableStreamBody.pipe(res);
        }

        // Parse Range header: e.g. "bytes=1000000-"
        const CHUNK_SIZE = 2 * 1024 * 1024; // 2MB per chunk
        const start = Number(range.replace(/\D/g, ""));
        const end = Math.min(start + CHUNK_SIZE, fileSize - 1);

        const contentLength = end - start + 1;

        res.writeHead(206, {
            "Content-Range": `bytes ${start}-${end}/${fileSize}`,
            "Accept-Ranges": "bytes",
            "Content-Length": contentLength,
            "Content-Type": contentType,
            "Cache-Control": "no-cache",
        });

        const partialDownload = await blobClient.download(start, contentLength);
        partialDownload.readableStreamBody.pipe(res);
    } catch (error) {
        console.error("Stream error:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};
