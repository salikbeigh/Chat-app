import "./ChatBox.css";
import assets from "../../assets/assets";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import { toast } from "react-toastify";

const ChatBox = () => {
  const { userData, messagesId, chatUser, messages, setMessages,chatVisible,setChatVisible } = useContext(AppContext);
  const [input, setInput] = useState("");
  const [image, setImage] = useState(null); 

  
  const sendMessage = async () => {
    try {
      if ((input || image) && messagesId) {
        const messageData = {
          sId: userData.id,
          createdAt: new Date().toISOString(),
        };

        
        if (input) {
          messageData.text = input;
          messageData.type = "text";
        }
       
        if (image) {
          messageData.image = image;
          messageData.type = "image";
        }

        
        await updateDoc(doc(db, "messages", messagesId), {
          messages: arrayUnion(messageData),
        });

        
        const userIDs = [chatUser.rId, userData.id];
        for (const id of userIDs) {
          const userChatsRef = doc(db, "chats", id);
          const userChatsSnapshot = await getDoc(userChatsRef);

          if (userChatsSnapshot.exists()) {
            const userChatData = userChatsSnapshot.data();

            const updatedChatsData = userChatData.chatsData.map((chat) => {
              if (chat.messageId === messagesId) {
                return {
                  ...chat,
                  lastMessage: input.slice(0, 30) || "Image", 
                  updatedAt: Date.now(),
                  messageSeen: id !== userData.id ? false : chat.messageSeen,
                };
              }
              return chat;
            });

            await updateDoc(userChatsRef, {
              chatsData: updatedChatsData,
            });
          }
        }

        setInput(""); 
        setImage(null); 
      }
    } catch (error) {
      
      if (error.message && error.message.includes('exceeds the maximum allowed size')) {
        toast.error("Storage is full. Failed to send message.");
      } else {
        console.error(error);
        toast.error("Failed to send message: " + error.message);
      }
    }
  };

  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
     
      if (file.size > 1048576) { 
        toast.error("File is too large. Please select a file less than 1MB.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result); 
      };
      reader.readAsDataURL(file); 
    }
  };

  
  const cancelImage = () => {
    setImage(null); 
  };

  
  useEffect(() => {
    if (messagesId) {
      const unsubscribe = onSnapshot(doc(db, "messages", messagesId), (res) => {
        if (res.exists()) {
          setMessages(res.data().messages.reverse());
        }
      });

      return () => unsubscribe();
    }
  }, [messagesId, setMessages]);
  

  return chatUser ? (
    <div className={`chat-box ${chatVisible ?"":"hidden"}`}>
      <div className="chat-user">
        <img src={chatUser.userData.avatar} alt="" />
        <p>
          {chatUser.userData.name} {Date.now()-chatUser.userData.lastSeen<=70000?<img className="dot" src={assets.green_dot} alt="" />:null}
        </p>
        <img src={assets.help_icon} className="help" alt="" />
        <img onClick={()=>setChatVisible(false)} src={assets.arrow_icon} className="arrow"/>
      </div>

      <div className="chat-msg">
        {messages && messages.length > 0 ? (
          messages.map((msg, index) => (
            <div key={index} className={msg.sId === userData.id ? "s-msg" : "r-msg"}>
              {msg.type === "text" ? (
                <p className="msg">{msg.text}</p>
              ) : (
                <img src={msg.image} alt="Sent" className="msg-img" />
              )}
              <div>
                <img
                  src={msg.sId === userData.id ? userData.avatar : chatUser.userData.avatar}
                  alt=""
                />
                <p>
                  {(() => {
                    const date = new Date(msg.createdAt);
                    const hours = date.getHours();
                    const minutes = date.getMinutes();
                    const ampm = hours >= 12 ? "PM" : "AM";
                    const formattedHours = hours % 12 || 12;
                    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
                    return `${formattedHours}:${formattedMinutes} ${ampm}`;
                  })()}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p></p>
        )}
      </div>

      <div className="chat-input">
        <input
          onChange={(e) => setInput(e.target.value)}
          value={input}
          type="text"
          placeholder="Send a message"
        />
        <input
          onChange={handleImageChange}
          type="file"
          id="image"
          accept="image/png, image/jpeg"
          hidden
        />
        <label htmlFor="image">
          <img src={assets.gallery_icon} alt="Attach Image" />
        </label>

        {image && (
          <div className="image-preview">
            <img src={image} alt="Preview" className="preview-img" />
            <button onClick={cancelImage} className="cancel-btn">x</button> {/* Cancel button */}
          </div>
        )}

        <img onClick={sendMessage} src={assets.send_button} alt="Send" />
      </div>
    </div>
  ) : 
  <div className="chat-welcome" style={{ display: chatVisible ? 'block' : 'none' }}>
  <img src={assets.logo_icon} alt="Welcome" />
  <p>Chat anytime, anywhere</p>
</div>

  
};

export default ChatBox;
