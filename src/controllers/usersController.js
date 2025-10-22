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

//GET /users/accounts
export const getUserAccounts = async (req, res) => {
    try {
        const unitsQuery = `SELECT * FROM UserAccounts`;
        const result = await executeQuery(unitsQuery);
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
        if (result.recordset.length === 0) { return res.status(404).json({ success: false, message: 'Unit not found' }); }
        res.status(200).json({ success: true, data: result.recordset[0] });
    } catch (error) {
        console.error('Connection error:', error);
        res.status(500).json({ success: false, message: error.message || error });
    }
};

// POST /users
export const addUser = async (req, res) => {
    try {
        const { FirstName, LastName, PhoneNumber, Email } = req.body;

        await executeQuery(
            `
            INSERT INTO Users (FirstName, LastName, PhoneNumber, Email) 
            VALUES (@FirstName, @LastName, @PhoneNumber, @Email);
            `,
            [
                { name: 'FirstName', value: FirstName },
                { name: 'LastName', value: LastName },
                { name: 'PhoneNumber', value: PhoneNumber },
                { name: 'Email', value: Email },
            ]
        );


        res.status(201).json({ message: 'User added successfully!' });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Failed to add user.' });
    }
};

// POST /users/accounts
export const addUserAccount = async (req, res) => {
    try {
        const { Brugernavn, Adgangskode } = req.body;

        if (!Brugernavn || !Adgangskode) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        const hashedPassword = await bcrypt.hash(Adgangskode, parseInt(process.env.BCRYPT_SALT_ROUNDS || '10'));

        await executeQuery(
            `INSERT INTO UserAccounts (Brugernavn, Adgangskode) VALUES (@Brugernavn, @Adgangskode)`,
            [
                { name: 'Brugernavn', value: Brugernavn },
                { name: 'Adgangskode', value: hashedPassword }
            ]
        );

        res.status(201).json("User registered successfully!");
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: 'Failed to register user.' });
    }
};