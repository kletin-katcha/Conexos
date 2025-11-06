import { useState } from 'react';
import { db } from '../services/firebase';
import { doc, updateDoc, increment } from 'firebase/firestore';

// Função auxiliar para formatar o timestamp
const formatDate = (timestamp) => {
    if (!timestamp) return 'Agora mesmo';
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('pt-BR', {
        timeStyle: 'short',
        dateStyle: 'short',
    }).format(date);
};

export default function Post({ post }) {
    const [liked, setLiked] = useState(false); // No futuro, isso pode ser verificado no DB
    const [likeCount, setLikeCount] = useState(post.likes);

    const handleLike = async () => {
        const postRef = doc(db, 'posts', post.id);
        const amount = liked ? -1 : 1;

        await updateDoc(postRef, {
            likes: increment(amount)
        });

        // Atualiza o estado local para refletir a mudança instantaneamente
        setLiked(!liked);
        setLikeCount(prev => prev + amount);
    };

    const renderPostContent = () => {
        if (post.type === 'music') {
            return (
                <iframe
                    className="rounded-xl mt-4"
                    src={post.embedUrl}
                    width="100%"
                    height="352"
                    frameBorder="0"
                    allowFullScreen=""
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy">
                </iframe>
            );
        }
        return <p className="text-gray-300 my-4">{post.content}</p>;
    };

    return (
        <div className="bg-gray-800 p-5 rounded-lg shadow-lg border border-gray-700">
            <div className="flex items-center space-x-4">
                <img src={post.avatar} alt={`${post.author}'s avatar`} className="w-12 h-12 rounded-full" />
                <div>
                    <p className="font-bold text-lg text-white">{post.author}</p>
                    <p className="text-xs text-gray-400">{formatDate(post.createdAt)}</p>
                </div>
            </div>
            {renderPostContent()}
            <div className="flex justify-between items-center text-gray-400 pt-2">
                <div className="flex space-x-6">
                    <button onClick={handleLike} className="flex items-center space-x-2 hover:text-cyan-400 transition-colors duration-200">
                        <i className={`fa-solid fa-heart ${liked ? 'text-red-500' : ''}`}></i>
                        <span>{likeCount} Curtidas</span>
                    </button>
                    <button className="flex items-center space-x-2 hover:text-cyan-400 transition-colors duration-200">
                        <i className="fa-solid fa-comment"></i>
                        <span>{post.comments.length} Comentários</span>
                    </button>
                </div>
                <button className="hover:text-cyan-400 transition-colors duration-200">
                    <i className="fa-solid fa-share-nodes"></i>
                </button>
            </div>
        </div>
    );
};
