import { executeQuery } from '../utils/executeQuery.js';

// GET 
export const getCameras = async (req, res) => {
    try {
        const locationsQuery = `SELECT * FROM CameraSensor`;
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
        const locationQuery = `SELECT * FROM CameraSensor WHERE ID = @ID`;
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
            INSERT INTO CameraSensor (Active, DateAdded, LocationID, UserID)
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
        console.error('Error addint new camera device:', error);
        res.status(500).json({ success: false, message: error.message || 'Failed to register the new camera device.' });
    }
};

// DELETE /camera/device/:id
export const deleteCamera = async (req, res) => {
    try {
        const { id } = req.params;

        const existing = await executeQuery(
            `SELECT ID FROM CameraSensor WHERE ID = @ID;`,
            [{ name: 'ID', value: id }]
        );

        if (existing.recordset.length === 0)
            return res.status(404).json({ message: 'Camera device not found.' });

        await executeQuery(
            `DELETE FROM CameraSensor WHERE ID = @ID;`,
            [{ name: 'ID', value: id }]
        );

        res.status(200).json({ message: 'Camera device deleted successfully!' });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Failed to delete camera device.' });
    }
};