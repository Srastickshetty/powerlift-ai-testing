import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "./firebase";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        emailVerified: firebaseUser.emailVerified,
      });

      try {
        const docRef = doc(db, "athletes", firebaseUser.uid);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          setProfile(null);
        } else {
          setProfile(docSnap.data());
        }
      } catch (err) {
        console.error("PROFILE FETCH FAILED:", err);
        setProfile(null);
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
    setProfile(undefined);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
