require('dotenv').config();
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || "CourtSync_Secret_Key_2024";

const tokenAdmin = jwt.sign({ userId: 26, roleId: 1 }, JWT_SECRET, { expiresIn: '1h' });
const tokenOwner = jwt.sign({ userId: 19, roleId: 2 }, JWT_SECRET, { expiresIn: '1h' });

console.log("ADMIN TOKEN:", tokenAdmin);
console.log("OWNER TOKEN:", tokenOwner);
