import { executeQuery } from '../utils/executeQuery.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

// GET /users
export const getUsers = async (req, res) => {
    try {
        const usersQuery = `SELECT ID, FirstName, LastName, PhoneNumber, Email, Username, Password, ProfilePicture FROM Users`;
        const result = await executeQuery(usersQuery);
        res.status(200).json({ success: true, data: result.recordset });
    } catch (error) {
        console.error('Connection error:', error);
        res.status(500).json({ success: false, message: error.message || error });
    }
};

// GET /users/:id
export const getUsersByID = async (req, res) => {
    const { id } = req.params;
    try {
        const userQuery = `SELECT ID, FirstName, LastName, PhoneNumber, Email, Username, Password, ProfilePicture FROM Users WHERE ID = @ID`;
        const result = await executeQuery(userQuery, [{ name: 'ID', value: id }]);
        if (result.recordset.length === 0) { return res.status(404).json({ success: false, message: 'User not found' }); }
        res.status(200).json({ success: true, data: result.recordset[0] });
    } catch (error) {
        console.error('Connection error:', error);
        res.status(500).json({ success: false, message: error.message || error });
    }
};

// POST /users
export const addUser = async (req, res) => {
    try {
        const { FirstName, LastName, PhoneNumber, Email, Username, Password } = req.body;

        const existingUser = await executeQuery(
            `SELECT COUNT(*) AS count FROM Users WHERE Username = @Username`,
            [{ name: 'Username', value: Username }]
        );

        if (existingUser.recordset[0].count > 0)
            return res.status(409).json({ message: 'Username already exists.' });

        const hashedPassword = await bcrypt.hash(Password, parseInt(process.env.BCRYPT_SALT_ROUNDS || '10'));

        await executeQuery(
            `
            INSERT INTO Users (FirstName, LastName, PhoneNumber, Email, Username, Password)
            VALUES (@FirstName, @LastName, @PhoneNumber, @Email, @Username, @Password);
            `,
            [
                { name: 'FirstName', value: FirstName },
                { name: 'LastName', value: LastName },
                { name: 'PhoneNumber', value: PhoneNumber || "" },
                { name: 'Email', value: Email },
                { name: 'Username', value: Username },
                { name: 'Password', value: hashedPassword },
            ]
        );

        res.status(201).json({ message: 'User added successfully!' });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Failed to add user.' });
    }
};

// PUT /users/:id
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { FirstName, LastName, PhoneNumber, Email, Username, Password } = req.body;

        const existingUser = await executeQuery(
            `SELECT Username FROM Users WHERE ID = @ID`,
            [{ name: 'ID', value: id }]
        );

        if (!existingUser.recordset.length)
            return res.status(404).json({ message: 'User not found.' });

        if (Username) {
            const usernameCheck = await executeQuery(
                `SELECT 1 FROM Users WHERE Username = @Username AND ID != @ID`,
                [
                    { name: 'Username', value: Username },
                    { name: 'ID', value: id }
                ]
            );

            if (usernameCheck.recordset.length)
                return res.status(409).json({ message: 'Username already exists.' });
        }

        const fields = [];
        const params = [{ name: 'ID', value: id }];

        if (FirstName !== undefined) {
            fields.push('FirstName = @FirstName');
            params.push({ name: 'FirstName', value: FirstName });
        }
        if (LastName !== undefined) {
            fields.push('LastName = @LastName');
            params.push({ name: 'LastName', value: LastName });
        }
        if (PhoneNumber !== undefined) {
            fields.push('PhoneNumber = @PhoneNumber');
            params.push({ name: 'PhoneNumber', value: PhoneNumber });
        }
        if (Email !== undefined) {
            fields.push('Email = @Email');
            params.push({ name: 'Email', value: Email });
        }
        if (Username !== undefined) {
            fields.push('Username = @Username');
            params.push({ name: 'Username', value: Username });
        }
        if (Password) {
            const hashedPassword = await bcrypt.hash(Password, parseInt(process.env.BCRYPT_SALT_ROUNDS || '10'));
            fields.push('Password = @Password');
            params.push({ name: 'Password', value: hashedPassword });
        }

        if (!fields.length)
            return res.status(400).json({ message: 'No fields to update.' });

        await executeQuery(`UPDATE Users SET ${fields.join(', ')} WHERE ID = @ID`, params);
        res.status(200).json({ message: 'User updated successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update user.' });
    }
};

// PUT /users/avatar/:id
export const updateUserProfilePicture = async (req, res) => {
    const { id } = req.params;

    try {
        const userExists = await executeQuery(
            `SELECT ID FROM Users WHERE ID = @ID`,
            [{ name: "ID", value: id }]
        );

        if (!userExists.recordset.length)
            return res.status(404).json({ success: false, message: "User not found." });

        let pictureUrl = null;

        if (req.file) {
            const fileName = req.file.filename;
            pictureUrl = `${process.env.HOST ? `http://${process.env.HOST}:${process.env.PORT}` : `http://localhost:4000`}/uploads/${fileName}`;
        }

        else if (req.body?.ProfilePicture) {
            const { ProfilePicture } = req.body;
            if (ProfilePicture.startsWith("http")) {
                pictureUrl = ProfilePicture;
            } else {
                return res.status(400).json({ success: false, message: "Invalid URL format." });
            }
        } else {
            return res.status(400).json({ success: false, message: "No picture provided." });
        }

        await executeQuery(
            `UPDATE Users SET ProfilePicture = @ProfilePicture WHERE ID = @ID`,
            [
                { name: "ProfilePicture", value: pictureUrl },
                { name: "ID", value: id },
            ]
        );

        res.status(200).json({
            success: true,
            message: "Profile picture URL saved successfully!",
            url: pictureUrl,
        });
    } catch (error) {
        console.error("Error updating profile picture:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update profile picture.",
            error: error.message,
        });
    }
};

// DELETE /users
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const existing = await executeQuery(
            `SELECT ID FROM Users WHERE ID = @ID;`,
            [{ name: 'ID', value: id }]
        );

        if (existing.length === 0)
            return res.status(404).json({ message: "User doesn't exists" });

        await executeQuery(
            `DELETE FROM Users WHERE ID = @ID;`,
            [{ name: 'ID', value: id }]
        );

        res.status(200).json({ message: 'User deleted successfully!' });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Failed to delete user.' });
    }
};