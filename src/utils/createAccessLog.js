import { executeQuery } from '../utils/executeQuery.js';

export async function createAccessLog({ KeycardID, LocationID, Granted }) {
    try {
        await executeQuery(
            `
      INSERT INTO AccessLog (AccessTime, KeycardID, LocationID, Granted)
      VALUES (GETDATE(), @KeycardID, @LocationID, @Granted);
      `,
            [
                { name: 'KeycardID', value: KeycardID },
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
