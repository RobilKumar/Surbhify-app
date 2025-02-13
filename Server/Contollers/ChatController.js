// createChat

const chatModel = require("../Models/chatModel");

const createChat = async (req, res) => {
  // here we are extracting two id of the user who is having conversation
  const { firstId, secondId } = req.body;

  try {
    const chat = await chatModel.findOne({
      members: { $all: [firstId, secondId] },
    });

    if (chat) return res.status(200).json(chat);

    const newChat = new chatModel({
      members: [firstId, secondId],
    });

    const response = await newChat.save();
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

// getUsersChats
const findUserChats = async (req, res) => {

  const userId = req.params.userId;

  console.log("this is from backend Chat Controller",userId);

  try {
    const chats = await chatModel.find({
      members: { $in: [userId] },
    });
    console.log("this is from backend Chat Controller",chats);
    res.status(200).json(chats);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

//findChat
const findChat = async (req, res) => {
  const { firstId, secondId } = req.params;

  try {
    const chats = await chatModel.find({
      members: { $all: [firstId, secondId] },
    });

    res.status(200).json(chats);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};



module.exports= {
    createChat,
    findUserChats,
    findChat
}