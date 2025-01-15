import { Route, Routes, useNavigate } from "react-router-dom"
import Login from "./pages/login/login"
import Chat from "./pages/Chat/Chat"
import ProfileUpdate from "./pages/ProfileUpdate/profileUpdate"
import { ToastContainer,  } from 'react-toastify';
import { useContext, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./config/firebase";
import { AppContext } from "./context/AppContext";



const App = () => {
  const navigate=useNavigate("")

const {loadUserData}=useContext(AppContext)

  useEffect(()=>{
onAuthStateChanged(auth,async(user)=>{

  if (user) {
    navigate("/chat")
    console.log(user)
    await loadUserData(user.uid)
  }else{
navigate("/")
  }
})
  },[])
  return (
    <>
    <ToastContainer />
<Routes>
  <Route path="/" element={<Login/>}/>
  <Route path="/Chat" element={<Chat/>}/>
  <Route path="/profile" element={<ProfileUpdate/>}/>

</Routes>
    </>
  )
}

export default App