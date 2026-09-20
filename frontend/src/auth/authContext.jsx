import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "./firebase";
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

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

      // LOGGED IN
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

    // Safety timeout: ensure loading and profile don't hang if Firebase is blocked or offline
    const timer = setTimeout(() => {
      setLoading(false);
      setProfile(prev => (prev === undefined ? null : prev));
    }, 1500);

    return () => {
      unsub();
      clearTimeout(timer);
    };
  }, []);

  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  const register = async (email, password, role = "client", pathway = "powerlifting") => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const newUser = userCredential.user;

    const initialProfile = {
      uid: newUser.uid,
      email: newUser.email,
      role: role || "client",
      pathway: pathway || "powerlifting",
      profile_complete: false,
      created_at: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, "athletes", newUser.uid), initialProfile, { merge: true });
    } catch (e) {
      console.warn("Firestore setDoc on register warning:", e);
    }

    localStorage.setItem(`profile_${newUser.uid}`, JSON.stringify(initialProfile));
    localStorage.setItem('active_world_discipline', pathway || 'powerlifting');
    
    setUser({
      uid: newUser.uid,
      email: newUser.email,
      emailVerified: true
    });
    setProfile(initialProfile);
    return userCredential;
  };

  const logout = async () => {
    sessionStorage.clear();
    setUser(null);
    setProfile(null);
    try {
      await signOut(auth);
    } catch (e) {
      console.warn("SignOut error:", e);
    }
  };

  const loginDemo = (role = 'athlete') => {
    const isCoach = role === 'coach';
    const demoUser = {
      uid: isCoach ? 'coach_demo' : 'athlete_demo',
      email: isCoach ? 'coach@titan-ai.in' : 'lifter@titan-ai.in',
      emailVerified: true
    };
    const demoProfile = {
      uid: demoUser.uid,
      email: demoUser.email,
      displayName: isCoach ? 'Coach Vikram Singh' : 'Srastick Shetty',
      role: isCoach ? 'coach' : 'client',
      profile_complete: true,
      bodyweight: 74,
      gender: 'male',
      training_max: {
        squat: 195,
        bench: 130,
        deadlift: 235
      }
    };
    sessionStorage.setItem('profileSetupComplete', 'true');
    localStorage.setItem(`profile_${demoUser.uid}`, JSON.stringify(demoProfile));
    setUser(demoUser);
    setProfile(demoProfile);
  };

  const updateProfileData = (updates) => {
    setProfile((prev) => {
      const updated = { ...(prev || {}), ...updates };
      const currentUid = user?.uid || prev?.uid || 'athlete_demo';
      try {
        localStorage.setItem(`profile_${currentUid}`, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to persist profile update to localStorage:', e);
      }
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, register, loginDemo, logout, updateProfileData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);