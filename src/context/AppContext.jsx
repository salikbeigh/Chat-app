import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { useEffect, useState, createContext } from "react";
import { auth, db } from "../config/firebase";
import { useNavigate } from "react-router-dom";

export const AppContext = createContext();

const AppContextProvider = (props) => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [chatData, setChatData] = useState([]);
  const [loading, setLoading] = useState(true); 
const [messagesId,setMessagesId] = useState(null);
const [messages,setMessages] = useState([]);
const [chatUser,setChatUser] = useState(null);

const [chatVisible,setChatVisible] = useState(false);
  
  const loadUserData = async (uid) => {
    try {
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const newUserData = userSnap.data();

       
        if (newUserData.id !== userData?.id) {
          setUserData(newUserData);
        }

       
        if (newUserData.avatar && newUserData.name) {
          navigate("/chat");
        } else {
          navigate("/profile");
        }

        
        await updateDoc(userRef, { lastSeen: Date.now() });

       
        const interval = setInterval(async () => {
          if (auth.currentUser) {
            await updateDoc(userRef, { lastSeen: Date.now() });
          }
        }, 60000);

        
        return () => clearInterval(interval);
      } else {
        console.error("User document not found");
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };


  useEffect(() => {
    if (userData) {
      const chatRef = doc(db, "chats", userData.id);

      const unSub = onSnapshot(chatRef, async (snapshot) => {
        if (snapshot.exists()) {
          const chatItems = snapshot.data().chatsData || [];
          const tempData = [];

          
          for (const item of chatItems) {
            try {
              const userRef = doc(db, "users", item.rId);
              const userSnap = await getDoc(userRef);

              if (userSnap.exists()) {
                const participantData = userSnap.data();
                tempData.push({ ...item, userData: participantData });
              }
            } catch (error) {
              console.error("Error fetching participant data:", error);
            }
          }

          
          setChatData(tempData.sort((a, b) => b.updatedAt - a.updatedAt));
        }

        setLoading(false); 
      });

      
      return () => unSub();
    }
  }, [userData]);

  
  const value = {

    userData,
    setUserData,
    chatData,
    setChatData,
    loadUserData,
    loading,
    messages,setMessages,
    messagesId,setMessagesId,
    chatUser,setChatUser,
    chatVisible,setChatVisible
  };

  return (
    <AppContext.Provider value={value}>
      {props.children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
