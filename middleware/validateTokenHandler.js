const asyncHandler = require("express-async-handler")
const jwt = require("jsonwebtoken")
const dotenv = require("dotenv").config();

const validateToken = asyncHandler (async (req,res,next) => {
    let token;
    let authHeader = req.headers.Authorization || req.headers.authorization;
    if(authHeader && authHeader.startsWith("Bearer")){
        token = authHeader.split(" ")[1];
        console.log("token: ",token),
        console.log("process.env.ACCESS_TOKEN_SECRET: ",process.env.ACCESS_TOKEN_SECRET)
        
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET,(err,decoded)=>{
            if(err){
                res.status(401);
                throw new Error("User is not authorized");
            }
            console.log(`decoded user ${decoded.user}`)
            console.log(`decoded doctor ${decoded.doctor}`)
            
            req.user = decoded.user || decoded.doctor;
            
            if (!req.user) {
                res.status(401);
                throw new Error("Token payload invalid");
            }

            console.log("printing the req.user: ",req.user);
            
            next();
        });

        if(!token){
            res.status(401);
            throw new Error("User is not authorized or token is missing");
        }
    }
    else{
        res.status(401);
        throw new Error("User is not authorized");
    }
});


module.exports = validateToken;