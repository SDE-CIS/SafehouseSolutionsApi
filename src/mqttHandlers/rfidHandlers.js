import { executeQuery } from '../utils/executeQuery.js';
import { createAccessLog } from '../utils/createAccessLog.js';

export async function handleRfidScan(topic, message, client) {
    try {
        const topicParts = topic.split('/');
        const userIdFromTopic = topicParts[0];
        const locationFromTopic = topicParts[2];
        const deviceId = topicParts[3];

        const msgStr = message.toString();
        let payload;

        try {
            payload = JSON.parse(msgStr);
        } catch {
            console.error(`Failed to parse MQTT message as JSON: ${msgStr}`);
            return;
        }

        const { cardUID, status } = payload;
        if (cardUID == undefined, status == undefined) {
            console.error(`cardUID or status not found in message: ${msgStr}`);
            return;
        }

        console.log(`RFID tag received: ${cardUID} from userId: ${userIdFromTopic}`);

        const query = 'SELECT TOP 1 UserID, ID FROM Keycards WHERE RfidTag = @tag';
        const result = await executeQuery(query, [{ name: 'tag', value: cardUID.toString() }]);

        let authorised = false;
        let actualUserId = 'unknown';
        let keycardId = null;

        if (result.recordset.length > 0) {
            authorised = true;
            actualUserId = result.recordset[0].UserID;
            keycardId = result.recordset[0].ID;
        }

        const responseTopic = `${userIdFromTopic}/rfid/${locationFromTopic}/${deviceId}/scan/${cardUID}`;
        const responsePayload = JSON.stringify({ authorised });
        client.publish(responseTopic, responsePayload, { qos: 1 }, (err) => {
            if (err) console.error('Failed to publish response:', err);
            else console.log(`Published authorization to ${responseTopic}: ${responsePayload}`);
        });

        await createAccessLog({ RfidTag: cardUID, LocationID: locationFromTopic, Granted: authorised });
        console.log(`Access log added for RfidTag ${cardUID} at LocationID ${locationFromTopic}, Granted: ${authorised}`);

        await updateSmartLockState(cardUID, status);

    } catch (err) {
        console.error('Unexpected error in handleRfidScan:', err);
    }
}

export async function handleAssignRfid(topic, message, client) {
    try {
        const msgStr = message.toString();
        let payload;

        // Try parsing the incoming MQTT message
        try {
            payload = JSON.parse(msgStr);
        } catch (jsonErr) {
            console.error(`Failed to parse MQTT message as JSON: ${msgStr}`);
            return;
        }

        const { DeviceID, status } = payload;

        if (!DeviceID) {
            console.error("Missing DeviceID in payload");
            return;
        }

        // Only insert if the status is "unassigned"
        if (status === "unassigned") {
            const query = `
                IF NOT EXISTS (SELECT 1 FROM RFIDScanners WHERE ID = @ID)
                BEGIN
                    INSERT INTO RFIDScanners (ID, Active, DateAdded, LocationID, UserID, Locked)
                    VALUES (@ID, @Active, GETDATE(), @Location, @UserID, @Locked)
                END
            `;

            await executeQuery(query, [
                { name: "ID", value: DeviceID },
                { name: "Active", value: false },
                { name: "Location", value: null },
                { name: "UserID", value: null },
                { name: "Locked", value: false }
            ]);

            console.log(`RFID sensor '${DeviceID}' inserted as unassigned.`);
        } else {
            console.log(`ℹSkipping insert: status is '${status}'`);
        }

    } catch (err) {
        console.error("Unexpected error in handleAssignRfid:", err);
    }
}

export async function publishAssignRfid(location, userId, deviceId, client) {
    const topic = `rfid/assign/${deviceId}`;
    const payload = JSON.stringify({
        userId: userId,
        location: location,
    });

    // --- Publish to MQTT ---
    client.publish(topic, payload, { qos: 1 }, (err) => {
        if (err) {
            console.error('Failed to publish MQTT message:', err);
        } else {
            console.log(`MQTT: Published assignment to ${topic}`);
        }
    });
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
        await updateSmartLockState(deviceId, isLocked);
    } catch (err) {
        console.error('Unexpected error in publishRfidLockState:', err);
    }
}



async function updateSmartLockState(deviceID, status) {
    const updateQuery = `
        UPDATE RFIDScanners
        SET Locked = @Locked
        WHERE ID = @DeviceID
    `;
    await executeQuery(updateQuery, [
        { name: "Locked", value: status },
        { name: "DeviceID", value: deviceID }]);
    console.log(`Locked state changed for device ${deviceID} To: ${status}`);
}