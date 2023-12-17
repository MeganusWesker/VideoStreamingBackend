export const sendToken = (res, user, statusCode, message) => {
    // getJwtToken user method implmented in usermodel 
    const token = user.getJwtToken();
    const userData = {
        _id: user._id,
        name: user.name,
        avatar: user.avatar,
        email: user.email,
        // role:user.role
    };
    const options = {
        httpOnly: process.env.NODE_ENV === "Development" ? false : true,
        secure: process.env.NODE_ENV === "Development" ? false : true,
        sameSite: "none",
        expires: new Date(Date.now() + Number(process.env.COOKIE_EXPIRE) * 24 * 60 * 60 * 1000)
    };
    res.status(statusCode).cookie("token", token, options).json({
        success: true,
        user: userData,
        message
    });
};
