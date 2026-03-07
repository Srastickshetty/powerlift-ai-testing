import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "./firebase";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(undefined); // undefined = loading
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      // NOT LOGGED IN
      if (!firebaseUser) {
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      // EMAIL NOT VERIFIED
      if (!firebaseUser.emailVerified) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          emailVerified: false,
        });
        setProfile(null);
        setLoading(false);
        return;
      }

      // LOGGED IN + VERIFIED
      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        emailVerified: true,
      });

      try {
        // Check both athletes collection for role determination
        const docRef = doc(db, "athletes", firebaseUser.uid);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          // Check localStorage fallback when Firestore is empty
          const localProfile = localStorage.getItem(`profile_${firebaseUser.uid}`);
          if (localProfile) {
            const userData = JSON.parse(localProfile);
            console.log("🔄 Using localStorage profile fallback");
            const role = userData.role || 
              (firebaseUser.email?.toLowerCase().includes("coach") ? "coach" : 
               firebaseUser.email?.toLowerCase().includes("admin") ? "admin" : "client");
            
            setProfile({
              ...userData,
              role,
              uid: firebaseUser.uid,
              email: firebaseUser.email
            });
          } else {
            setProfile(null);        // NEW USER
          }
        } else {
          const userData = docSnap.data();
          
          // Determine role based on explicit role field or email pattern
          const role = userData.role || 
            (firebaseUser.email?.toLowerCase().includes("coach") ? "coach" : 
             firebaseUser.email?.toLowerCase().includes("admin") ? "admin" : "client");
          
          setProfile({
            ...userData,
            role,
            uid: firebaseUser.uid,
            email: firebaseUser.email
          }); // EXISTING USER
        }
      } catch (err) {
        console.error("PROFILE FETCH FAILED:", err);
        // FAIL SAFE — CHECK LOCALSTORAGE FALLBACK
        const localProfile = localStorage.getItem(`profile_${firebaseUser.uid}`);
        if (localProfile) {
          const userData = JSON.parse(localProfile);
          console.log("🔄 Using localStorage profile fallback due to error");
          const role = userData.role || 
            (firebaseUser.email?.toLowerCase().includes("coach") ? "coach" : 
             firebaseUser.email?.toLowerCase().includes("admin") ? "admin" : "client");
          
          setProfile({
            ...userData,
            role,
            uid: firebaseUser.uid,
            email: firebaseUser.email
          });
        } else {
          setProfile(null);
        }
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);