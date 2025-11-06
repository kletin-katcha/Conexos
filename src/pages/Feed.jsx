import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../services/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';

import CreatePost from '../components/CreatePost';
import Post from '../components/Post';

export default function Feed() {
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const postsData = [];
            querySnapshot.forEach((doc) => {
                postsData.push({ id: doc.id, ...doc.data() });
            });
            setPosts(postsData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleCreatePost = async (postData) => {
        await addDoc(collection(db, 'posts'), {
            author: user.profile.name,
            avatar: user.profile.avatar,
            userId: user.auth.uid,
            likes: 0,
            comments: [],
            createdAt: serverTimestamp(),
            ...postData
        });
    };

    if (loading) {
        return <div className="p-8 text-center">Carregando feed...</div>
    }

    return (
        <div className="p-8 max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold text-cyan-400 mb-6">Feed</h1>
            <CreatePost onPost={handleCreatePost} />
            <div className="space-y-6">
                {posts.map(post => (
                    <Post key={post.id} post={post} />
                ))}
            </div>
        </div>
    );
};
