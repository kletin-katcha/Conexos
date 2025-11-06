import { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';

import ChatMessage from '../components/ChatMessage';
import MessageInput from '../components/MessageInput';

export default function Chat() {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [activeConversationUser, setActiveConversationUser] = useState(null);
    const [messages, setMessages] = useState([]);

    // Busca todos os usuários, exceto o logado
    useEffect(() => {
        const q = query(collection(db, 'users'), where('name', '!=', user.profile.name));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUsers(usersData);
            if (!activeConversationUser && usersData.length > 0) {
                setActiveConversationUser(usersData[0]);
            }
        });
        return () => unsubscribe();
    }, [user.profile.name, activeConversationUser]);

    // Busca mensagens da conversa ativa
    useEffect(() => {
        if (!user || !activeConversationUser) return;

        // Cria um ID de chat consistente
        const chatId = [user.auth.uid, activeConversationUser.id].sort().join('_');
        const messagesRef = collection(db, 'chats', chatId, 'messages');
        const q = query(messagesRef, orderBy('createdAt'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const messagesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMessages(messagesData);
        });

        return () => unsubscribe();
    }, [user, activeConversationUser]);

    const handleSendMessage = async (text) => {
        if (!activeConversationUser) return;
        const chatId = [user.auth.uid, activeConversationUser.id].sort().join('_');
        const messagesRef = collection(db, 'chats', chatId, 'messages');

        await addDoc(messagesRef, {
            text,
            userId: user.auth.uid,
            user: user.profile.name,
            avatar: user.profile.avatar,
            createdAt: serverTimestamp(),
        });
    };

    if (!activeConversationUser) {
        return <div className="p-8 text-center">Nenhum outro usuário encontrado.</div>
    }

    return (
        <div className="flex h-full">
            <div className="w-80 bg-gray-800 flex flex-col">
                <div className="p-4 border-b border-gray-700">
                    <h2 className="text-xl font-bold">Mensagens Diretas</h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {users.map(u => (
                        <div key={u.id} onClick={() => setActiveConversationUser(u)} className={`flex items-center space-x-3 p-3 cursor-pointer hover:bg-gray-700 ${activeConversationUser.id === u.id ? 'bg-gray-700' : ''}`}>
                            <img src={u.avatar} className="w-10 h-10 rounded-full" />
                            <span className="font-medium">{u.name}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex-1 flex flex-col bg-gray-850">
                <div className="p-4 border-b border-gray-700 flex items-center space-x-3">
                    <img src={activeConversationUser.avatar} className="w-10 h-10 rounded-full" />
                    <h2 className="text-xl font-bold">{activeConversationUser.name}</h2>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                     {messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
                </div>
                <MessageInput onSend={handleSendMessage} />
            </div>
        </div>
    );
};
