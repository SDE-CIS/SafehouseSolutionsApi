import { executeQuery } from '../utils/executeQuery.js';

// GET /camera/:id?page=1&limit=20
export const getCameraDataByID = async (req, res) => {
    try {
        const { id } = req.params;
        let { page = 1, limit = 20 } = req.query;

        if (!id) {
            return res.status(400).json({ success: false, message: 'id must be defined.' });
        }

        // Convert to integers and enforce sane bounds
        page = Math.max(parseInt(page), 1);
        limit = Math.max(parseInt(limit), 1);
        const offset = (page - 1) * limit;

        // Count total rows for pagination metadata
        const countQuery = `SELECT COUNT(*) AS total FROM CameraData WHERE DeviceID = @DeviceID`;
        const countResult = await executeQuery(countQuery, [{ name: "DeviceID", value: id }]);
        const totalItems = countResult.recordset[0].total;

        // Paginated data query
        const dataQuery = `
            SELECT * FROM CameraData
            WHERE DeviceID = @DeviceID
            ORDER BY ImageTimestamp DESC
            OFFSET @Offset ROWS
            FETCH NEXT @Limit ROWS ONLY;
        `;

        const result = await executeQuery(dataQuery, [
            { name: "DeviceID", value: id },
            { name: "Offset", value: offset },
            { name: "Limit", value: limit }
        ]);

        if (result.recordset.length === 0) {
            return res.status(404).json({ success: false, message: 'No camera data found for this device.' });
        }

        // Pagination metadata
        const totalPages = Math.ceil(totalItems / limit);

        res.status(200).json({
            success: true,
            pagination: {
                currentPage: page,
                totalPages,
                totalItems,
                limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            },
            data: result.recordset
        });
    } catch (error) {
        console.error('Error fetching paginated camera data:', error);
        res.status(500).json({ success: false, message: error.message || error });
    }
};

// GET 
export const getCameras = async (req, res) => {
    try {
        const locationsQuery = `SELECT * FROM CameraSensors`;
        const result = await executeQuery(locationsQuery);
        res.status(200).json({ success: true, data: result.recordset });
    } catch (error) {
        console.error('Connection error:', error);
        res.status(500).json({ success: false, message: error.message || error });
    }
};

// GET /camera/device/:id
export const getCameraByID = async (req, res) => {
    const { id } = req.params;
    try {
        const locationQuery = `SELECT * FROM CameraSensors WHERE ID = @ID`;
        const result = await executeQuery(locationQuery, [{ name: 'ID', value: id }]);
        if (result.recordset.length === 0)
            return res.status(404).json({ success: false, message: 'Camera device not found.' });
        res.status(200).json({ success: true, data: result.recordset[0] });
    } catch (error) {
        console.error('Connection error:', error);
        res.status(500).json({ success: false, message: error.message || error });
    }
};

// POST /camera/device
export const addCamera = async (req, res) => {
    try {
        const { Active, LocationID, UserID } = req.body;

        await executeQuery(
            `
            INSERT INTO CameraSensors (Active, DateAdded, LocationID, UserID)
            VALUES (@Active, GETDATE(), @LocationID, @UserID);
            `,
            [
                { name: 'Active', value: Active },
                { name: 'LocationID', value: LocationID },
                { name: 'UserID', value: UserID }
            ]
        );

        res.status(201).json({ success: true, message: 'New camera device registered successfully!' });
    } catch (error) {
        console.error('Error adding new camera device:', error);
        res.status(500).json({ success: false, message: error.message || 'Failed to register the new camera device.' });
    }
};

// DELETE /camera/device/:id
export const deleteCamera = async (req, res) => {
    try {
        const { id } = req.params;

        const existing = await executeQuery(
            `SELECT ID FROM CameraSensors WHERE ID = @ID;`,
            [{ name: 'ID', value: id }]
        );

        if (existing.recordset.length === 0)
            return res.status(404).json({ message: 'Camera device not found.' });

        await executeQuery(
            `DELETE FROM CameraSensors WHERE ID = @ID;`,
            [{ name: 'ID', value: id }]
        );

        res.status(200).json({ message: 'Camera device deleted successfully!' });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Failed to delete camera device.' });
    }
};