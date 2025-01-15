// Import the necessary functions from Firebase SDK
import { initializeApp } from "firebase/app";
import { createUserWithEmailAndPassword, getAuth, sendPasswordResetEmail, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, doc, setDoc, query, where, getDocs, collection } from "firebase/firestore";
import { toast } from "react-toastify";

// Firebase configuration from the Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyDLtLEhiLqAIw7_fK64J6VTEhb808mt8zA",
  authDomain: "chat-app-414ce.firebaseapp.com",
  projectId: "chat-app-414ce",
  storageBucket: "chat-app-414ce.firebasestorage.app",
  messagingSenderId: "935246522889",
  appId: "1:935246522889:web:c5a56298485fead50966d8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); 
const db = getFirestore(app);

const signup = async (userName, email, password) => {
  try {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const user = res.user;
    
    // Save user data in Firestore
    await setDoc(doc(db, "users", user.uid), {
      id: user.uid,
      username: userName.toLowerCase(), // Corrected the typo
      email,
      name: "",
      avatar: "",
      bio: "Hey, there! I am using the chat app.",
      lastSeen: Date.now()
    });
    
    // Initialize chat data for the user
    await setDoc(doc(db, "chats", user.uid), {
      chatsData: [] // Corrected the syntax
    });
    
  } catch (error) {
    console.error(error);
    toast.error(error.code.split("/")[1].split("-").join(" "))
  }
};

const login=async(email, password)=>{
 
  try {
    await signInWithEmailAndPassword(auth,email, password)
  } catch (error) {
    console.error(error);
    toast.error(error.code.split("/")[1].split("-").join(" "))
  }
}
const logout= async()=>{
  try {
    await signOut(auth)
  } catch (error) {
    console.error(error);
    toast.error(error.code.split("/")[1].split("-").join(" "))
  }
 
}
const resetPass=async(email)=>{
  if(!email) {
    toast.error("Please enter your email address.");
    return null;
  }
  try {
    const userRef=collection(db,"users")
    const q=query(userRef,where("email","==",email))
    const querySnap=await getDocs(q)
    if(!querySnap.empty) {
await sendPasswordResetEmail(auth,email);
toast.success("Reset email sent successfully")
    }
    else{
      toast.error("No user found with this email address.")
    }
  } catch (error) {
    console.error(error)
    toast.error("Failed to send reset email.")
  }
}

export {signup,login,logout,auth,db,resetPass}