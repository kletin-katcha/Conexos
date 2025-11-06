import { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';

import ChatMessage from '../components/ChatMessage';
import MessageInput from '../components/MessageInput';

export default function Comunidades() {
    const { user } = useAuth();
    const [communities, setCommunities] = useState([]);
    const [activeCommunity, setActiveCommunity] = useState(null);
    const [activeChannel, setActiveChannel] = useState(null);
    const [messages, setMessages] = useState([]);

    // Busca as comunidades
    useEffect(() => {
        const q = query(collection(db, 'communities'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const communitiesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setCommunities(communitiesData);
            if (!activeCommunity && communitiesData.length > 0) {
                setActiveCommunity(communitiesData[0]);
                if (communitiesData[0].channels?.length > 0) {
                    setActiveChannel(communitiesData[0].channels[0]);
                }
            }
        });
        return () => unsubscribe();
    }, [activeCommunity]);

    // Busca as mensagens do canal ativo
    useEffect(() => {
        if (!activeCommunity || !activeChannel) return;

        const messagesRef = collection(db, 'communities', activeCommunity.id, 'channels', activeChannel.id, 'messages');
        const q = query(messagesRef, orderBy('createdAt'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const messagesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMessages(messagesData);
        });
        return () => unsubscribe();
    }, [activeCommunity, activeChannel]);

    const handleSendMessage = async (text) => {
        if (!activeCommunity || !activeChannel) return;

        const messagesRef = collection(db, 'communities', activeCommunity.id, 'channels', activeChannel.id, 'messages');
        await addDoc(messagesRef, {
            text: text,
            user: user.profile.name,
            avatar: user.profile.avatar,
            userId: user.auth.uid,
            createdAt: serverTimestamp(),
        });
    };

    if (!activeCommunity || !activeChannel) {
        return <div className="p-8 text-center">Carregando comunidades...</div>
    }

    return (
        <div className="flex h-full font-sans">
            <div className="w-20 bg-gray-900 p-3 flex flex-col items-center space-y-4">
                {communities.map(c => (
                    <button key={c.id} onClick={() => { setActiveCommunity(c); setActiveChannel(c.channels[0]); }} className={`w-12 h-12 rounded-full ${c.id === activeCommunity.id ? 'ring-2 ring-cyan-400' : ''} bg-gray-700 flex items-center justify-center text-2xl ${c.color || 'text-gray-400'} transition-all`}>
                        <i className={c.icon || 'fas fa-users'}></i>
                    </button>
                ))}
            </div>

            <div className="w-64 bg-gray-800 text-gray-300 flex flex-col">
                <div className="p-4 border-b border-gray-700">
                    <h2 className="text-lg font-bold text-white">{activeCommunity.name}</h2>
                </div>
                <div className="flex-1 p-2 space-y-1">
                    {activeCommunity.channels.map(ch => (
                        <button key={ch.id} onClick={() => setActiveChannel(ch)} className={`w-full text-left px-3 py-2 rounded ${ch.id === activeChannel.id ? 'bg-cyan-500/20 text-white' : ''} hover:bg-gray-700`}>
                           # {ch.name}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 flex flex-col bg-gray-700">
                <div className="p-4 border-b border-gray-600">
                    <h2 className="text-xl font-bold text-white"># {activeChannel.name}</h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
                </div>
                <MessageInput onSend={handleSendMessage} />
            </div>
        </div>
    );
};
