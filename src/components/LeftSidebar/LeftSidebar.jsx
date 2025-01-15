import { useNavigate } from "react-router-dom";
import assets from "../../assets/assets";
import "./LeftSidebar.css";
import {
  arrayUnion,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  setDoc,
  getDoc,
  where, 
} from "firebase/firestore";
import { db } from "../../config/firebase";
import { useContext, useState, useEffect } from "react";
import { toast } from "react-toastify";
import { AppContext } from "../../context/AppContext";

const LeftSidebar = () => {
  const navigate = useNavigate();
  const [searchUser, setSearchUser] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const { userData, chatData, setChatUser, setMessagesId, messagesId,chatVisible,setChatVisible } = useContext(AppContext);

  useEffect(() => {
    console.log("userData in LeftSidebar:", userData);
  }, [userData]);

  const inputHandler = async (e) => {
    const input = e.target.value.trim().toLowerCase();
    if (!input) {
      setShowSearch(false);
      setSearchUser(null);
      return;
    }

    setShowSearch(true);

    try {
      const userRef = collection(db, "users");
      const q = query(userRef, where("username", "==", input)); 
      const querySnap = await getDocs(q);

      if (!querySnap.empty) {
        const fetchedUserData = querySnap.docs[0].data();

        
        const userExists = chatData?.some((chat) => chat.userData.id === fetchedUserData.id);

        if (fetchedUserData.id !== userData.id && !userExists) {
          setSearchUser(fetchedUserData); 
        } else {
          setSearchUser(null); 
        }
      } else {
        setSearchUser(null); 
      }
    } catch (error) {
      console.error(error);
      toast.error("Error fetching user: " + error.message);
    }
  };

  const addChat = async () => {
    if (!searchUser || !userData) {
      toast.error("Invalid user or user data.");
      return;
    }

    const messagesRef = collection(db, "messages");
    const chatsRef = collection(db, "chats");

    try {
      
      const newMessageRef = doc(messagesRef);
      await setDoc(newMessageRef, {
        createdAt: serverTimestamp(),
        messages: [],
      });

     
      const senderChatData = {
        messageId: newMessageRef.id,
        lastMessage: "",
        rId: searchUser.id, 
        updatedAt: Date.now(),
        messageSeen: true,
        unseenMessagesCount: 0, 
      };

      await updateDoc(doc(chatsRef, userData.id), {
        chatsData: arrayUnion(senderChatData),
      });

     
      const receiverChatData = {
        messageId: newMessageRef.id,
        lastMessage: "",
        rId: userData.id, 
        updatedAt: Date.now(),
        messageSeen: false, 
        unseenMessagesCount: 1, 
      };

      await updateDoc(doc(chatsRef, searchUser.id), {
        chatsData: arrayUnion(receiverChatData),
      });

      setSearchUser(null); 
      setShowSearch(false);
      const uSnap=await getDoc(doc(db,"users",userData.id))
      const uData=uSnap.data();
      setChat({
        messagesId:newMessageRef.id,
        lastMessage:"",
        rId:userData.id,
        updatedAt:Date.now(),
        messageSeen:true,
        userData:uData
      })
      setShowSearch(false)
      setChatVisible(true);
    } catch (error) {
      console.error(error);
      toast.error("Error adding chat: " + error.message);
    }
  };

  const setChat = async (chat) => {
    try {
      setMessagesId(chat.messageId);
      setChatUser(chat);

      const userChatsRef = doc(db, "chats", userData.id);
      const userChatsSnapshot = await getDoc(userChatsRef);
      const userChatsData = userChatsSnapshot.data();

      const chatIndex = userChatsData.chatsData.findIndex((c) => c.messageId === chat.messageId);
      userChatsData.chatsData[chatIndex].messageSeen = true;

     
      userChatsData.chatsData[chatIndex].unseenMessagesCount = 0;

      await updateDoc(userChatsRef, {
        chatsData: userChatsData.chatsData,
      });
      setChatVisible(true);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getLastMessage = (chat) => {
    if (chat.lastMessage && chat.lastMessage.startsWith("[Image]")) {
      return "Image"; 
    } else {
      return chat.lastMessage || "No message yet"; 
    }
  }
 
  

  return (
    <div className={`ls ${chatVisible?"hidden":""}`}>
      <div className="ls-top">
        <div className="ls-nav">
          <img src={assets.logo} className="logo" alt="Logo" />
          <div className="menu">
            <img src={assets.menu_icon} alt="Menu" />
            <div className="sub-menu">
              <p onClick={() => navigate("/profile")}>Edit Profile</p>
              <hr />
              <p onClick={() => navigate("/")}>Logout</p>
            </div>
          </div>
        </div>
        <div className="ls-search">
          <img src={assets.search_icon} alt="Search" />
          <input onChange={inputHandler} type="text" placeholder="Search here..." />
        </div>
      </div>

      <div className="ls-list">
        {showSearch && searchUser ? (
          <div onClick={addChat} className="friends add-user">
            <img src={searchUser.avatar || assets.avatar_icon} alt="Profile" />
            <p>{searchUser.name}</p>
          </div>
        ) : chatData && chatData.length > 0 ? (
          chatData.map((chat) => (
            chat.userData.id !== userData.id && (
              <div
                onClick={() => setChat(chat)}
                className={`friends ${chat.messageSeen ? '' : 'border'}`}
                key={chat.userData.id}
              >
                <img src={chat.userData.avatar} alt={chat.userData.name} />
                <div>
                  <p>{chat.userData.name}</p>
                  <span>{getLastMessage(chat)}</span> 
                 
                  
                </div>
              </div>
            )
          ))
        ) : (
          <p>No chats available</p>
        )}
      </div>
    </div>
  );
};

export default LeftSidebar;
