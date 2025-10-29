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
