import ErrorHandler from "../utils/ErrorHandler.js";
const error = (err, req, res, next) => {
    if (err.code === 11000)
        err = new ErrorHandler(`email is already registerd`, 403);
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal server error please try again later";
    res.status(err.statusCode).json({
        success: false,
        message: err.message
    });
};
export default error;
