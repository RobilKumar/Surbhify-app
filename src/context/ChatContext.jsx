import { createContext, useCallback, useEffect, useState } from "react";
import { baseUrl, getRequest, postRequest } from "../Utils/service";
import { io } from "socket.io-client";

// import { defineConfig } from "vite";
// import dotenv from "dotenv";


// dotenv.config();

export const ChatContext = createContext();

export const ChatContextProvider = ({ children, user }) => {
  const [userChats, setUserChats] = useState(null);
  const [isUserChatsLoading, setIsUserChatsLoading] = useState(false);
  const [userChatsError, setUserChatsError] = useState(null);
  const [potentialChats, setPotentialChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState(null);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState(null);
  const [sendTextMessageError, setSendTextMessageError] = useState(null);
  const [newMessage, setNewMessage] = useState(null);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [allUsers,setAllUsers]=useState([]);

  console.log("Notification", notifications);

  // initial socket

  console.log("hello this is to check env of client",import.meta.env.VITE_SOCKET_URL);

  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_SOCKET_URL);
    setSocket(newSocket);

    // cleanup function

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  // add online users
  useEffect(() => {
    if (socket === null) return;
    // emit is used to trigger the event , here addNewUser is created in socket
    socket.emit("addNewUser", user?._id);
    socket.on("getOnlineUsers", (res) => {
      setOnlineUsers(res);
    });

    return () => {
      socket.off("getOnlineUsers");
    };
  }, [socket]);

  // send message

  //============>
  useEffect(() => {
    if (socket === null) return;
    // here we are taking of id who is not the user, means recipient id becoz chat have two member
    const recipientId = currentChat?.members.find((id) => id !== user?._id);

    socket.emit("sendMessage", { ...newMessage, recipientId });
  }, [newMessage]);
  //============>

  // recieve message and notification
  //============>
  useEffect(() => {
    if (socket === null) return;
    // res is the response
    socket.on("getMessage", (res) => {
      if (currentChat?._id !== res.chatId) return;

      setMessages((prev) => [...prev, res]);
    });

    socket.on("getNotification", (res) => {
      const isChatOpen = currentChat?.members.some((id) => id === res.senderId);

      if (isChatOpen) {
        setNotifications((prev) => [{ ...res, isRead: true }, ...prev]);
      } else {
        setNotifications((prev) => [res, ...prev]);
      }
    });

    // clear function
    return () => {
      socket.off("getMessage");
      socket.off("getNotification");
    };
  }, [socket, currentChat]);

  //============>
  useEffect(() => {
    const getUsers = async () => {
      const response = await getRequest(`${baseUrl}/users`);

      if (response.error) {
        return console.log("Error fetching users", response);
      }

      const pChats = response.filter((u) => {
        let isChatCreated = false;
        if (user?._id === u._id) return false;

        if (userChats) {
          isChatCreated = userChats?.some((chat) => {
            return chat.members[0] === u._id || chat.members[1] === u._id;
          });
        }

        return !isChatCreated;
      });

      setPotentialChats(pChats);
      setAllUsers(response);
    };
    getUsers();
  }, [userChats]);

  useEffect(() => {
    const getUserChats = async () => {
      if (user?._id) {
        setIsUserChatsLoading(true);
        setUserChatsError(null);
        // console.log("ChatContext in UserId===>", user._id);
        const response = await getRequest(`${baseUrl}/chats/${user?._id}`);

        // console.log("UserChats in ChatContext===>", response);
        setIsUserChatsLoading(false);

        if (response.error) {
          return setUserChatsError(response);
        }

        setUserChats(response);
      }
    };

    getUserChats(); // Call the function
  }, [user,notifications]);

  //getMessage  to show

  useEffect(() => {
    const getMessages = async () => {
      if (!currentChat?._id) return; // Ensure currentChat is valid
      setIsMessagesLoading(true);
      setMessagesError(null);

      const response = await getRequest(
        `${baseUrl}/messages/${currentChat?._id}`
      );

      // console.log("UserMessage in ChatContext===>", response);
      setIsMessagesLoading(false);

      if (response.error) {
        return setMessagesError(response);
      }

      setMessages(response);
    };

    getMessages(); // Call the function
  }, [currentChat]);

  const updateCurrentChat = useCallback(async (chat) => {
    console.log("Updating current chat:", chat);
    setCurrentChat(chat);
  }, []);

  //   const updateCurrentChat = (chat) => {
  //     console.log("Updating current chat:", chat);
  //     setCurrentChat(chat);
  // };

  const createChat = useCallback(async (firstId, secondId) => {
    const response = await postRequest(
      `${baseUrl}/chats`,
      JSON.stringify({
        firstId,
        secondId,
      })
    );

    if (response.error) {
      return console.log("Error creating chat", response);
    }

    setUserChats((prev) => [...prev, response]);
  });

  // method to send message when we click on ui send icon
  const sendTextMessage = useCallback(
    async (textMessage, sender, currentChatId, setTextMessage) => {
      if (!textMessage) return console.log("You must type something...");

      const response = await postRequest(
        `${baseUrl}/messages`,
        JSON.stringify({
          chatId: currentChatId,
          senderId: sender._id,
          text: textMessage,
        })
      );
      if (response.error) {
        return setSendTextMessageError(response);
      }

      setNewMessage(response);
      setMessages((prev) => [...prev, response]);
      setTextMessage("");
    },
    []
  );

  const markAllNotificationsAsRead=useCallback((notifications)=>{
  const mNotifications= notifications.map((n)=>{
    return {...n, isRead:true}
  })
    setNotifications(mNotifications);
  },[])


 const markNotificationAsRead= useCallback((n,userChats,user,notifications)=>{
    
 const desiredChat= userChats.find(chat=>{
    const chatMembers= [user._id, n.senderId];
    const isDesiredChat=chat?.members.every((member)=>{
      return chatMembers.includes(member);
    })
    return isDesiredChat;
 })

 // mark notification as read
 const mNotifications= notifications.map((el)=>{
 if(n.senderId===el.senderId){
  return {...n, isRead:true}
 }else{
  return el;
 }
 })

  updateCurrentChat(desiredChat);
  setNotifications(mNotifications);
 },[]);



 const markThisUserNotificationsAsRead= useCallback((thisUserNotifications,notifications)=>{
  // mark nitification as read of userChats
  const mNotifications= notifications.map((el)=>{
    let notification;
    thisUserNotifications.forEach(n=>{
   if(n.senderId===el.senderId){
    notification= {...n, isRead:true}
   }else{
    notification =el
   }
    })
    return notification;
  })
  setNotifications(mNotifications);
 },[])


  return (
    <ChatContext.Provider
      value={{
        userChats,
        isUserChatsLoading,
        userChatsError, // Include error in the context
        potentialChats,
        createChat,
        updateCurrentChat,
        currentChat,
        messagesError,
        isMessagesLoading,
        messages,
        sendTextMessage,
        onlineUsers,
        notifications,
        allUsers,
        markAllNotificationsAsRead,
        markNotificationAsRead,
        markThisUserNotificationsAsRead
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
