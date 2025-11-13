import { executeQuery } from '../utils/executeQuery.js';

export async function createAccessLog({ RfidTag, LocationID, Granted }) {
    try {
        await executeQuery(`
            INSERT INTO AccessLog (AccessTime, RfidTag, LocationID, Granted)
            VALUES (GETDATE(), @RfidTag, @LocationID, @Granted);
            `,
            [
                { name: 'RfidTag', value: RfidTag },
                { name: 'LocationID', value: LocationID },
                { name: 'Granted', value: Granted }
            ]
        );
        return { success: true };
    } catch (error) {
        console.error('Error adding access log:', error);
        throw error;
    }
}