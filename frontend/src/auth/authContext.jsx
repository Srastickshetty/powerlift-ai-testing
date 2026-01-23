import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "./firebase";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const res = await fetch(
            `http://localhost:5000/api/users/${firebaseUser.uid}`
          );
          const profile = await res.json();

          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            role: profile.role,
            athlete_id: profile.athlete_id,
          });
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

/* ✅ THIS EXPORT WAS MISSING OR BROKEN */
export const useAuth = () => {
  return useContext(AuthContext);
};
