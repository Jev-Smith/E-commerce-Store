import User from '../models/user.model.js';
import {redis} from '../lib/redis.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const generateTokens = (userId) => {
    const accessToken = jwt.sign({userId}, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '15m'
    })  
    
    const refreshToken = jwt.sign({userId}, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: '7d'
    })

    return {accessToken, refreshToken};
}

const storeRefreshToken = async (userId, refreshToken) => {
    await redis.set(`refresh_token:${userId}`, refreshToken, 'EX', 7*24*60*60);
}

const setCookies = (res, accessToken, refreshToken) => {
    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000
    })

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
    })
}

const signup = async (req, res) => {
    const {name, email, password} = req.body;

    try {
        const userExists = await User.findOne({email});
    
        if(userExists){
            return res.status(404).json({message: 'User already exists'});
        }
    
        const user = await User.create({name, email, password});

        //authentication
        const {accessToken, refreshToken} = generateTokens(user._id);
        await storeRefreshToken(user._id, refreshToken);

        setCookies(res, accessToken, refreshToken);
    
        res.status(201).json({
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            message: "User created successfully"
        });
    } 
    catch (error) {
        res.status(404).json({message: error.message});
    }
}


const login = (req, res) => {
    res.send('Login route called');
}

const logout = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if(refreshToken){
            const decode = jwt.decode(refreshToken, process.env.REFRESH_TOKEN_SECRET);
            await redis.del(`refresh_token:${decode.userId}`)
        }

        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        res.status(200).json({message: 'Log out successful'});
    } 
    catch (error) {
        res.status(500).json({
            message: "Could not log user out",
            error: error.message
        })
    }
}

export default {
    signup,
    login,
    logout
}