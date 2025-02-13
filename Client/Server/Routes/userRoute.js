const express= require('express');
const router= express.Router();
const {registerUser, loginUser, findUser, getUser}=require("../Contollers/userController");




router.post("/Register",registerUser)
router.post("/login", loginUser)
router.get("/find/:userId",findUser);
router.get("/",getUser);


module.exports= router;
