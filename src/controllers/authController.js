import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { executeQuery } from '../utils/executeQuery.js';

const generateToken = (userId, username, secret, expiresIn) => jwt.sign({ id: userId, username }, secret, { expiresIn });

const updateRefreshToken = async (userId, refreshToken) =>
    executeQuery(
        `UPDATE UserAccounts SET RefreshToken = @RefreshToken WHERE ID = @ID`,
        [
            { name: 'RefreshToken', value: refreshToken },
            { name: 'ID', value: userId }
        ]
    );

// POST /auth
export const authUser = async (req, res) => {
    const { Username, Password } = req.body;

    try {

        if(!Username || !Password)
            return res.status(400).json({ message: 'Please provide username and password.' });

        const result = await executeQuery(
            `
            SELECT ID, Brugernavn, Adgangskode
            FROM UserAccounts
            WHERE Brugernavn = @Brugernavn
            `,
            [
                { name: 'Brugernavn', value: Username },
            ]
        );

        const user = result.recordset[0];

        if (!user)
            return res.status(400).json({ success: false, message: "This user doesn't exist." });

        const isPasswordValid = await bcrypt.compare(Password, user.Adgangskode);
        if (!isPasswordValid)
            return res.status(400).json({ success: false, message: 'Invalid username or password.' });

        const accessToken = generateToken(user.ID, user.Brugernavn, process.env.JWT_SECRET, '1h');
        const refreshToken = generateToken(user.ID, user.Brugernavn, process.env.REFRESH_TOKEN_SECRET, '1d');
        const updateResult = await updateRefreshToken(user.ID, refreshToken);
        console.log('Refresh token update result:', updateResult);

        const simplifiedUser = { id: user.ID, username: user.Brugernavn };
        res.json({ success: true, accessToken, refreshToken, user: simplifiedUser });

    } catch (error) {
        console.error('Authentication error:', error);
        res.status(500).json({ success: false, message: 'Error during authentication: ' + error });

    }
};

// POST /auth/refresh
export const refreshToken = async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res.status(400).json({ message: 'Refresh token is required.' });
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

        const result = await executeQuery(
            `
            SELECT ID, Brugernavn, Adgangskode
            FROM UserAccounts
            WHERE ID = @ID AND RefreshToken = @RefreshToken
            `,
            [
                { name: 'ID', value: decoded.id },
                { name: 'RefreshToken', value: refreshToken }
            ]
        );

        const user = result.recordset[0];
        if (!user) {
            return res.status(401).json({ message: 'Invalid refresh token.' });
        }

        const accessToken = generateToken(user.Id, user.Username, process.env.JWT_SECRET, '1h');
        res.status(200).json({ message: 'Token refreshed successfully', accessToken });

    } catch (error) {
        console.error('Error during refresh token processing:', error);
        res.status(401).json({ message: 'Error: ' + error });
    }
};