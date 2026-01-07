import User from '../models/user.model.js';
import {redis} from '../lib/redis.js';
import jwt from 'jsonwebtoken';

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
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
        });
    } 
    catch (error) {
        res.status(404).json({message: error.message});
    }
}

const login = async (req, res) => {
    try {
        const {email, password} = req.body;
        const user = await User.findOne({email});

        const isMatch = await user.comparePasswords(password);

        if(user && isMatch){
            const {accessToken, refreshToken} = generateTokens(user._id);
            await storeRefreshToken(user._id, refreshToken);
            setCookies(res, accessToken, refreshToken);
        }
        else {
            return res.status(400).json({ message: 'Log in unsuccessful' });
        }

        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        })
    } 
    catch (error) {
        res.status(500).json({message: error.message});
    }
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

const refreshAccessToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
    
        if(!refreshToken) {
            return res.status(401).json({message: 'Refresh token not found'});
        }
    
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const storedToken = await redis.get(`refresh_token:${decoded.userId}`);
    
        if(storedToken !== refreshToken) {
            return res.status(401).json('Invalid refresh token');
        }
    
        const accessToken = jwt.sign({userId: decoded.userId }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: '15m'
        })
    
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000
        })
        
        res.status(201).json({message: 'Access token created'});
    } 
    catch (error) {
        res.status(500).json({message: error.message});
    }
}

export default {
    signup,
    login,
    logout,
    refreshAccessToken
}