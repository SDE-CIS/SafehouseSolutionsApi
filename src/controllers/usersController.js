import { executeQuery } from '../utils/executeQuery.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

// GET /users
export const getUsers = async (req, res) => {
    try {
        const usersQuery = `SELECT * FROM Users`;
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
        const userQuery = `SELECT * FROM Users WHERE ID = @ID`;
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
        const { FirstName, LastName, PhoneNumber, Email, Brugernavn, Adgangskode } = req.body;

        const existingUser = await executeQuery(
            `SELECT COUNT(*) AS count FROM Users WHERE Brugernavn = @Brugernavn`,
            [{ name: 'Brugernavn', value: Brugernavn }]
        );

        if (existingUser.recordset[0].count > 0)
            return res.status(409).json({ message: 'Username already exists.' });

        const hashedPassword = await bcrypt.hash(Adgangskode, parseInt(process.env.BCRYPT_SALT_ROUNDS || '10'));

        await executeQuery(
            `
            INSERT INTO Users (FirstName, LastName, PhoneNumber, Email, Brugernavn, Adgangskode)
            VALUES (@FirstName, @LastName, @PhoneNumber, @Email, @Brugernavn, @Adgangskode);
            `,
            [
                { name: 'FirstName', value: FirstName },
                { name: 'LastName', value: LastName },
                { name: 'PhoneNumber', value: PhoneNumber || "" },
                { name: 'Email', value: Email },
                { name: 'Brugernavn', value: Brugernavn },
                { name: 'Adgangskode', value: hashedPassword }
            ]
        );

        res.status(201).json({ message: 'User added successfully!' });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Failed to add user.' });
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