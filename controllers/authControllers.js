const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

//generate JWT token
const generateToken = (user) => {
    return jwt.sign({ id: user._id } , process.env.JWT_SECRET, { expiresIn: '24h'});
};


//Login route
exports.login = async (req, res) => {
    const {username, password} = req.body;

    try {
        const user = await User.findOne({ username });
        if( !user) return res.status(401).json({
            success: false,
            message: 'Invalid credentials',
            error: {
                detail: 'User was not found'
            }
        });
        
        const isMatch = await bcrypt.compare(password, user.password);
        if( !isMatch) return res.status(401).json({
            success: false,
            message: 'Invalid credentials',
            error: {
                detail:'Invalid password'
            }
        });

        //generate tokens
        const token = generateToken(user);

        //return the tokens
        res.json({
            success: true,
            message: 'Login successfully',
            token: token});
    } catch (err) {
        res.status(500).json({message: err.message});
    }
};

//refresh token route
// exports.refreshToken = (req, res) =>{
//     const { refreshToken } = req.body;
//     if(!refreshToken) return res.status(403).json({message: 'No token provided' });

//     jwt.verify(refreshToken, process.env.JWT_SCERET , (err, user) => {
//         if(err) return res.status(403).json({ message: 'Invalid token'});
//         const newToken = generateToken(user);
//         res.json({ token: newToken});
//     });
// };