import { useState } from 'react';
import GiphyModal from './GiphyModal';

export default function MessageInput({ onSend }) {
    const [message, setMessage] = useState('');
    const [showGiphy, setShowGiphy] = useState(false);

    const handleSend = (e) => {
        e.preventDefault();
        if(message.trim()) {
            onSend(message);
            setMessage('');
        }
    };

    const handleGifSelect = (gifUrl) => {
        onSend(gifUrl);
        setShowGiphy(false);
    };

    return (
        <>
            {showGiphy && <GiphyModal onSelect={handleGifSelect} onClose={() => setShowGiphy(false)} />}
            <form onSubmit={handleSend} className="p-4 bg-gray-700">
                <div className="flex items-center bg-gray-600 rounded-lg px-3">
                     <button type="button" onClick={() => setShowGiphy(true)} className="text-cyan-400 hover:text-cyan-300 text-xl p-2">
                        <i className="fas fa-gift"></i>
                    </button>
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Digite sua mensagem..."
                        className="flex-1 bg-transparent p-3 text-white placeholder-gray-400 focus:outline-none font-mono"
                    />
                    <button type="submit" className="text-cyan-400 hover:text-cyan-300 text-xl p-2">
                        <i className="fas fa-paper-plane"></i>
                    </button>
                </div>
            </form>
        </>
    );
};
