import { useEffect,useState } from "react";
import { getRequest,baseUrl } from "../Utils/service";

export const useFetchRecipientUser= (chat,user)=>{
     const [recipientUser,setRecipientUser]=useState(null)
     const [error,setError]=useState(null);

      // here we are taking of id who is not the user, means recipient id becoz chat have two member
     const recipientId= chat?.members.find((id)=>id!==user?._id)


     useEffect(()=>{
        const getUser= async()=>{
        if(!recipientId) return null

        const response= await getRequest(`${baseUrl}/users/find/${recipientId}`)

        if(response.error){
            return setError(error);
        }


        setRecipientUser(response);
        }

       

        getUser();
     },[recipientId])

     return {recipientUser}
}