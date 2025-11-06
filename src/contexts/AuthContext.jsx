import { createContext, useState, useContext, useEffect } from 'react';
import { auth, db, isFirebaseConfigured } from '../services/firebase'; // Importa a verificação
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { mockUser } from '../data/mock';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Se o Firebase não estiver configurado, não faz nada e para o loading
        if (!isFirebaseConfigured) {
            setLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
            if (authUser) {
                const userDocRef = doc(db, 'users', authUser.uid);
                const userDoc = await getDoc(userDocRef);
                setUser({ auth: authUser, profile: userDoc.exists() ? userDoc.data() : null });
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const register = async (email, password, username) => {
        if (!isFirebaseConfigured) {
            alert('Firebase não configurado. Entrando em modo de simulação.');
            setUser({ auth: { uid: 'mock-uid' }, profile: mockUser });
            return;
        }
        const authUser = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, 'users', authUser.user.uid), {
            name: username,
            bio: `Olá! Sou novo(a) na Conectare.`,
            avatar: `https://i.pravatar.cc/150?u=${authUser.user.uid}`,
            ownedGames: [],
        });
    };

    const login = (email, password) => {
        if (!isFirebaseConfigured) {
             alert('Firebase não configurado. Entrando em modo de simulação.');
             setUser({ auth: { uid: 'mock-uid' }, profile: mockUser });
            return;
        }
        return signInWithEmailAndPassword(auth, email, password);
    };

    // Login simulado para verificação da UI
    const simulatedLogin = () => {
        setUser({ auth: { uid: 'mock-uid' }, profile: mockUser });
    };

    const logout = () => {
        if (!isFirebaseConfigured) {
            setUser(null);
            return;
        }
        return signOut(auth);
    };

    const value = { user, login, logout, register, simulatedLogin };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
