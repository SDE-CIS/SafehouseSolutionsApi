import { executeQuery } from '../utils/executeQuery.js';
import { createAccessLog } from '../utils/createAccessLog.js';

export async function handleRfidScan(topic, message, client) {
    try {
        const topicParts = topic.split('/');
        const userIdFromTopic = topicParts[0];
        const locationNameFromTopic = topicParts[2];

        const msgStr = message.toString();
        let payload;

        try {
            payload = JSON.parse(msgStr);
        } catch {
            console.error(`Failed to parse MQTT message as JSON: ${msgStr}`);
            return;
        }

        const rfidTag = payload?.cardUID;
        if (!rfidTag) {
            console.error(`cardUID not found in message: ${msgStr}`);
            return;
        }

        console.log(`RFID tag received: ${rfidTag} from userId: ${userIdFromTopic}`);

        const query = 'SELECT TOP 1 UserID, ID FROM Keycards WHERE RfidTag = @tag';
        const result = await executeQuery(query, [{ name: 'tag', value: rfidTag.toString() }]);

        let authorised = false;
        let actualUserId = 'unknown';
        let keycardId = null;

        if (result.recordset.length > 0) {
            authorised = true;
            actualUserId = result.recordset[0].UserID;
            keycardId = result.recordset[0].ID;
        }

        const responseTopic = `${userIdFromTopic}/rfid/frontdoor/1/scan/${rfidTag}`;
        const responsePayload = JSON.stringify({ authorised });
        client.publish(responseTopic, responsePayload, { qos: 1 }, (err) => {
            if (err) console.error('Failed to publish response:', err);
            else console.log(`Published authorization to ${responseTopic}: ${responsePayload}`);
        });

        const locationQuery = 'SELECT ID FROM Locations WHERE LocationName = @name';
        const locationResult = await executeQuery(locationQuery, [{ name: 'name', value: locationNameFromTopic }]);
        if (locationResult.recordset.length === 0) {
            console.error(`Location not found for name: ${locationNameFromTopic}`);
            return;
        }

        const locationId = locationResult.recordset[0].ID;
        await createAccessLog({ RfidTag: rfidTag, LocationID: locationId, Granted: authorised });
        console.log(`Access log added for RfidTag ${rfidTag} at LocationID ${locationId}, Granted: ${authorised}`);
    } catch (err) {
        console.error('Unexpected error in handleRfidScan:', err);
    }
}

export async function handleAssignRfid(topic, message, client) {
    try {
        const msgStr = message.toString();
        let payload;

        try {
            payload = JSON.parse(msgStr)
        } catch (jsonErr) {
            console.error(`Failed to parse MQTT message as JSON: ${msgStr}`);
            return;
        }

        if (payload.status === "unassigned") {
            const responseTopic = `rfid/assign`;
            const responsePayload = JSON.stringify({ userId: 1 });

            client.publish(responseTopic, responsePayload, { qos: 1 }, (err) => {
                if (err) console.error('Failed to publish response:', err);
                else console.log(`Published authorization to ${responseTopic}: ${responsePayload}`);
            });
        }
    } catch (err) {
        console.error('Unexpected error in handleAssignRfid:', err);
    }
}

export async function publishRfidLockState(client, userId, location, deviceId, isLocked) {
    try {
        const topic = `${userId}/rfid/${location}/${deviceId}/settings`;
        const payload = JSON.stringify({ isLocked: isLocked });
        console.log(`Payload: ${payload}`);

        client.publish(topic, payload, { qos: 1 }, (err) => {
            if (err) {
                console.error(`Failed to publish rfid lock state settings:`, err);
            } else {
                console.log(`Rfid lock settings published successfully to ${topic}`);
            }
        });
    } catch (err) {
        console.error('Unexpected error in publishRfidLockState:', err);
    }
}