const express = require("express");
const { findUserChats, findChat, createChat } = require("../Contollers/ChatController");

const router= express.Router();

router.post("/",createChat);
router.get("/:userId",findUserChats);
router.get("/find/:firstId/:secondId",findChat);


module.exports= router;