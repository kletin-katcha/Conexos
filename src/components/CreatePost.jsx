import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import MusicPostModal from './MusicPostModal';

export default function CreatePost({ onPost }) {
    const { user } = useAuth();
    const [content, setContent] = useState('');
    const [showMusicModal, setShowMusicModal] = useState(false);

    const handleTextPost = (e) => {
        e.preventDefault();
        if (!content.trim()) return;
        onPost({ type: 'text', content });
        setContent('');
    };

    const handleMusicPost = (musicData) => {
        onPost(musicData);
        setShowMusicModal(false);
    };

    return (
        <>
            {showMusicModal && <MusicPostModal onPost={handleMusicPost} onClose={() => setShowMusicModal(false)} />}
            <div className="bg-gray-800 p-4 rounded-lg shadow-lg mb-8 border border-gray-700">
                <div className="flex items-start space-x-4">
                    <img src={user.avatar} alt="Avatar" className="w-12 h-12 rounded-full" />
                    <form onSubmit={handleTextPost} className="flex-1">
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-400 resize-none"
                            placeholder={`No que você está pensando, ${user.name}?`}
                            rows="3"
                        ></textarea>
                        <div className="flex justify-between items-center mt-3">
                             <button type="button" onClick={() => setShowMusicModal(true)} className="text-green-400 hover:text-green-300 font-bold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center space-x-2">
                                <i className="fab fa-spotify"></i>
                                <span>Música</span>
                            </button>
                            <button type="submit" className="bg-cyan-500 hover:bg-cyan-400 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200">
                                Postar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};
