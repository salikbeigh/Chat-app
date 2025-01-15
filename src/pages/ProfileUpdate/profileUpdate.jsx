import { onAuthStateChanged } from "firebase/auth";
import assets from "../../assets/assets";
import "./profileUpdate.css";
import { useContext, useEffect, useState } from "react";
import { auth, db } from "../../config/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AppContext } from "../../context/AppContext";

const ProfileUpdate = () => {
  const navigate = useNavigate();
  const [image, setImage] = useState(null); 
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [uid, setUid] = useState("");
  const [prevImage, setPrevImage] = useState("");
  const { setUserData } = useContext(AppContext);

  const profileUpdate = async (event) => {
    event.preventDefault();
  
    try {
      if (!image && !prevImage) {
        toast.error("Please upload a profile picture");
        return;
      }
  
      const docRef = doc(db, "users", uid);
  
      if (image) {
        
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64String = reader.result;
  
          
          await updateDoc(docRef, {
            bio,
            name,
            avatar: base64String,
          });
  
          
          setPrevImage(base64String);
  
          const snap = await getDoc(docRef);
          setUserData(snap.data());
  
          toast.success("Profile updated successfully!", {
            autoClose: 1500,
          });
          setTimeout(() => {
            navigate("/chat");
          }, 2000);
        };
  
        reader.readAsDataURL(image); 
      } else {
        
        await updateDoc(docRef, {
          bio,
          name,
          avatar: prevImage,
        });
  
        const snap = await getDoc(docRef);
        setUserData(snap.data());
  
        toast.success("Profile updated successfully!", {
          autoClose: 1000,
        });
        setTimeout(() => {
          navigate("/chat");
        }, 2000);
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred: " + error.message);
    }
  };
  
  

  
  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid);
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const userData = docSnap.data();
          setName(userData.name || ""); 
          setBio(userData.bio || "Hey,There i am using chat app"); 
          setPrevImage(userData.avatar || ""); 
        }
      } else {
        navigate("/");
      }
    });
  }, [navigate]);

  return (
    <div className="profile">
      <div className="profile-container">
        <form onSubmit={profileUpdate}>
          <h3>Profile Details</h3>
          <label htmlFor="avatar">
            <input
              onChange={(e) => setImage(e.target.files[0])}
              type="file"
              id="avatar"
              accept=".png, .jpg, .jpeg"
              hidden
            />
            <img
              src={image ? URL.createObjectURL(image) : prevImage || assets.avatar_icon}
              alt="Profile"
            />
            Upload profile image
          </label>
          <input
            onChange={(e) => setName(e.target.value)}
            value={name}
            type="text"
            placeholder="Your name"
            required
          />
          <textarea
            onChange={(e) => setBio(e.target.value)}
            value={bio}
            placeholder="Write profile bio"
            required
          ></textarea>
          <button type="submit">Save</button>
        </form>
        <img
          className="profile-pic"
          src={image ? URL.createObjectURL(image) : prevImage || assets.avatar_icon}
          alt="Profile"
        />
      </div>
    </div>
  );
};

export default ProfileUpdate;
