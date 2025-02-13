import { useContext, useEffect, useState } from "react"
import { getRequest,baseUrl } from "../Utils/service"
import { ChatContext } from "../context/ChatContext"




export const useFetchLatestMessage=(chat)=>{
  const {newMessage,notifications}= useContext(ChatContext);
  const[latestMessage, setLatestMessage]= useState(null);



    useEffect(()=>{
      const getMessages= async()=>{
        const response= await getRequest(`${baseUrl}/messages/${chat ?._id}`);
         console.log("this is the response from useFetchLatestMessage",response);
        if(response.error){
            return console.log("Error getting messages....",error);
        }

        const lastMessage= response[response ?.length - 1];
        setLatestMessage(lastMessage)
      }
      getMessages()
    },[newMessage,notifications]);
    return {latestMessage};
}