import { executeQuery } from '../utils/executeQuery.js';

// GET /units
export const getUnits = async (req, res) => {
    try {
        const unitsQuery = `
            SELECT u.*, l.LocationName, st.SensorTypeName
            FROM Unit u
            LEFT JOIN Locations l ON u.LocationID = l.ID
            LEFT JOIN SensorType st ON u.SensorTypeID = st.ID
        `;

        const result = await executeQuery(unitsQuery);
        res.status(200).json({ success: true, data: result.recordset });
    } catch (error) {
        console.error('Connection error:', error);
        res.status(500).json({ success: false, message: error.message || error });
    }
};

// GET /units/:id
export const getUnitById = async (req, res) => {
    const { id } = req.params;

    try {
        const unitQuery = `
            SELECT u.*, l.LocationName, st.SensorTypeName
            FROM Unit u
            LEFT JOIN Locations l ON u.LocationID = l.ID
            LEFT JOIN SensorType st ON u.SensorTypeID = st.ID
            WHERE u.ID = @ID
        `;

        const result = await executeQuery(unitQuery, [{ name: 'ID', value: id }]);
        if (result.recordset.length === 0) { return res.status(404).json({ success: false, message: 'Unit not found' }); }
        res.status(200).json({ success: true, data: result.recordset[0] });
    } catch (error) {
        console.error('Error fetching unit by ID:', error);
        res.status(500).json({ success: false, message: error.message || error });
    }
};