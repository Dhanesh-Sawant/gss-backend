// custom middleware to accept request body in particular format
// and in json
// and response in json only

const {constants} = require("../constants")

const errorHandler = (err, req, res, next) => {
    let errorCode = res.statusCode ? res.statusCode : 500

    // if (err instanceof mongoose.Error.CastError) {
    //     errorCode = 400; // Bad Request
    // }
    
    switch(errorCode) {
        case constants.VALIDATION_ERROR:
            res.json({title: "Validation Error", message: err.message, stackTrace: err.stack})
            break
        
        case constants.NOT_FOUND:
            res.json({title: "Not Found", message: err.message, stackTrace: err.stack})
            break

        case constants.FORBIDDEN:
            res.json({title: "Forbidden", message: err.message, stackTrace: err.stack})
            break

        case constants.UNAUTHORIZED:
            res.json({title: "Unauthorized", message: err.message, stackTrace: err.stack})
            break
        
        case constants.SERVER_ERROR:
            res.json({title: "Server Error", message: err.message, stackTrace: err.stack})
            break
        
        default:
            console.log("No error, all good!!")
            break
    }
    
};

module.exports = errorHandler;