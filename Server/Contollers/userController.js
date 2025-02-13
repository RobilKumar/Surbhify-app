const userModel= require('../Models/userModel.js');
const bcrypt = require('bcryptjs');
const validator= require("validator");
const jwt= require("jsonwebtoken");



const createToken= (_id)=>{
    const jwtkey= process.env.JWT_SECRET_KEY;

    return jwt.sign({_id},jwtkey,{expiresIn:"3d"});
}


const registerUser= async(req,res)=>{
    try{
        const {name, email, password}=req.body;


        let user= await userModel.findOne({email});
    
        if(user) return res.status(400).json("User with the given email already exist..");
        if(!name || !email || !password) return res.status(400).json("All fields are required");
    
        if(!validator.isEmail(email)) return res.status(400).json("email must be  valid email");
    
        if(!validator.isStrongPassword(password)) return res.status(400).json("Password must be a strong password");
    
        user = new userModel({name,email,password});
    
        const salt= await bcrypt.genSalt(10);
    
        user.password= await bcrypt.hash(user.password,salt);
        await user.save();
    
    
        const token= createToken(user.id);
    
        res.status(200).json({_id: user._id, name,email,token});
    }catch(error){
        console.log(error);
        res.status(500).json(error);

    }

}


// const loginUser= async (req,res)=>{
//     console.log("this is loginUser Controller");
//     const {email,password}= req.body;
//     try {
//         let user= await userModel.findOne({email});
//         console.log("this is loginUser findOne");


//         console.log(user.password)
//         if(!user) return res.status(400).json("Invalid email or password");
       
//         const isValidPassword= await bcrypt.compare(password,user.password);
        
//         if(!isValidPassword) return res.status(400).json("Invalid email or password...");

//         const token = createToken(user._id);
//         console.log("this is loginUser findOne");
//        return res.status(200).json({_id: user._id, name,email,token});
//     } catch (error) {
        
//     }
// }




const loginUser = async (req, res) => {
    console.log("this is loginUser Controller");
    const { email, password } = req.body;

    try {
        let user = await userModel.findOne({ email });
        console.log("this is loginUser findOne");

        if (!user) return res.status(400).json("Invalid email or password");

        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) return res.status(400).json("Invalid email or password...");

        const token = createToken(user._id);
        console.log("this is loginUser token generated");
        return res.status(200).json({ _id: user._id, name: user.name, email, token });
    } catch (error) {
        console.error("Error in loginUser:", error); // Log the error for debugging
        return res.status(500).json("Internal server error");
    }
};



const findUser= async(req,res)=>{
    const userId= req.params.userId;

    try {
        const user= await userModel.findById(userId);
        res.status(200).json(user);
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
}



const getUser= async(req, res)=>{
    

    try {
        const users= await userModel.find();
        res.status(200).json(users);
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
}


module.exports={
    registerUser,
    loginUser,
    findUser,
    getUser,
}



