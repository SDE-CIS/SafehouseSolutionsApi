import { executeQuery } from '../utils/executeQuery.js';

export async function createAccessLog({ KeycardID, LocationID }) {
    try {
        await executeQuery(
            `
      INSERT INTO AccessLog (AccessTime, KeycardID, LocationID)
      VALUES (GETDATE(), @KeycardID, @LocationID);
      `,
            [
                { name: 'KeycardID', value: KeycardID },
                { name: 'LocationID', value: LocationID }
            ]
        );
        return { success: true };
    } catch (error) {
        console.error('Error adding access log:', error);
        throw error;
    }
}
