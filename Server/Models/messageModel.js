const mongoose= require("mongoose");
const messageSChema= new mongoose.Schema({
    chatId:String,
    senderId:String,
    text:String
},
{
   timestamps:true
})

const messageModel= mongoose.model("Message",messageSChema);
module.exports= messageModel;