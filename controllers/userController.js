import asyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { getAllUsers, createUser, getUserByEmail } from "../models/userModel.js";

//@desc Register the user
//@route GET /api/users/register
//@access PUBLIC
const registerUser = asyncHandler ( async (req,res) => {
    const {username, email, password} = req.body;
    if(!username || !email || !password){
        res.status(400);
        throw new Error("All fields are necessary");
    } 

    const existingUser = await getUserByEmail(email);

    if(existingUser.length!==0){
        res.status(400);
        throw new Error("User already Registered..");
    }

    console.log("isUser: ",existingUser);
    

    const hashedPassword = await bcrypt.hash(password,10)
    console.log("hashedpassword: ",hashedPassword)


    const createdUser = await createUser(username,email,hashedPassword);

    if (!createdUser) {
            res.status(500).json({ message: "Error creating user" });
            return;
    }

    console.log("user created: ",createdUser);

    if(createdUser){
        res.status(201).json({
            "user_id": createdUser.user_id,
            "email": createdUser.email,
            "username": createdUser.username,
            "createdAt": createdUser.createdAt,
            "updatedAt" : createdUser.updatedAt
        })
    }
    else{
        res.status(400);
        throw new Error("Error in creation of user!!")
    }

});

//@desc login the user
//@route POST /api/users/login
//@access PUBLIC
const loginUser = asyncHandler ( async (req,res) => {
    const {email, password} = req.body;
    console.log(req.body)
    if(!email || !password){
        res.status(400);
        throw new Error("All fields are necessary");
    }
    console.log("now will be checking for whether the user exists or not..")
    const existingUser = await getUserByEmail(email);

    console.log("existingUser: ",existingUser);
    
    if(existingUser.length===0){
        res.status(400);
        throw new Error("User does'nt exists..register first!!");
    }

    if(await bcrypt.compare(password,existingUser[0].password)){
        
        const accessToken = jwt.sign({
            user: {
                username: existingUser[0].username,
                email: existingUser[0].email,
                user_id: existingUser[0].user_id,
                createdAt: existingUser[0].createdAt,
                updatedAt: existingUser[0].updatedAt
            }
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "15m"}
        );
        console.log("accessToken: ",accessToken);

        res.status(200).json({accessToken});
    }
    else{
        res.status(401);
        throw new Error("Password is wrong!!")
    }

    res.status(200).json({"message" : "user login successfully!!"})
});


//@desc get the current user
//@route GET /api/users/current
//@access PRIVATE
const currentUser = asyncHandler ( async (req,res) => {

    res.status(200).json(req.user)
});


export {registerUser, loginUser, currentUser}