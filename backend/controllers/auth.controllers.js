const signup = (req, res) => {
    res.send('Signup route called');
}

const login = (req, res) => {
    res.send('Login route called');
}

const logout = (req, res) => {
    res.send('Logout route called');
}

export default {
    signup,
    login,
    logout
}