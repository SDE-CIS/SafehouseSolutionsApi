import { executeQuery } from '../utils/executeQuery.js';

// GET /locations
export const getLocations = async (req, res) => {
    try {
        const locationsQuery = `SELECT * FROM Locations`;
        const result = await executeQuery(locationsQuery);
        res.status(200).json({ success: true, data: result.recordset });
    } catch (error) {
        console.error('Connection error:', error);
        res.status(500).json({ success: false, message: error.message || error });
    }
};

// GET /locations/:id
export const getLocationsByID = async (req, res) => {
    const { id } = req.params;
    try {
        const locationQuery = `SELECT * FROM Locations WHERE ID = @ID`;
        const result = await executeQuery(locationQuery, [{ name: 'ID', value: id }]);
        if (result.recordset.length === 0) { return res.status(404).json({ success: false, message: 'Unit not found' }); }
        res.status(200).json({ success: true, data: result.recordset[0] });
    } catch (error) {
        console.error('Connection error:', error);
        res.status(500).json({ success: false, message: error.message || error });
    }
};

// POST /locations
export const addLocation = async (req, res) => {
    try {
        const { LocationName } = req.body;

        if (!LocationName || typeof LocationName !== 'string') {
            return res.status(400).json({ 
                message: getMessage(messages.error.typeError) 
            });
        }

        await executeQuery(
            `
            INSERT INTO Locations (LocationName) 
            VALUES (@LocationName);
            `,
            [{ name: 'LocationName', value: LocationName }]
        );

        res.status(201).json({ message: 'Location added successfully!' });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Failed to add location.' });
    }
};
