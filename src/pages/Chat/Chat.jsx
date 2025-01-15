import "./Chat.css"
import ChatBox from "../../components/ChatBox/ChatBox"
import LeftSidebar from "../../components/LeftSidebar/LeftSidebar"
import RightSidebar from "../../components/RightSidebar/RightSidebar"
import { useContext, useEffect, useState } from "react"
import { AppContext } from "../../context/AppContext"


const Chat = () => {
  const {chatData,userData}=useContext(AppContext);
  const [loadings,setloadings]=useState(true)
  useEffect(()=>{
if (chatData&&userData) {
  setloadings(false)
}
  },[chatData,userData])
  return (
    <div className="chat">
      {
        loadings ?<p className="loading">Loading...</p>
        :<div className="chat-container">
        <LeftSidebar/>
        <ChatBox/>
        <RightSidebar/>
      </div>}
      
    </div>
  )
}

export default Chat