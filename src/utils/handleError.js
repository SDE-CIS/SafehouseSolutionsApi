export const handleError = () => {
    console.error('Connection error:', error);
    res.status(500).json({ message });
};