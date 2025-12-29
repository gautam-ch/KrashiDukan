const errorHandler = async(err, req, res, next) => {

    //for server 
    //console.error("Global error handler caught:",err);


    const errorDetails = {
        message: err.message,
        stack: err.stack,
        path: req.originalUrl,
        method: req.method,
        time: new Date()
    }


    console.log("Error details from middleware", JSON.stringify(errorDetails, null, 2));

    //here we can persist error into db



    // Check if headers have already been sent to avoid "Can't set headers after they are sent" errors
    if (res.headersSent) {
        return next(err); // Pass to default Express error handler if response already started
    }


    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal server error!";

    res.status(statusCode).json({
        success: false,
        message,
        errors:err.errors || null
    })


}

export default errorHandler;