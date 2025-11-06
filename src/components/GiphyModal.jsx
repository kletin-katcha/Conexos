import { useState, useEffect } from 'react';
import { fetchGifs } from '../services/giphy';

export default function GiphyModal({ onSelect, onClose }) {
    const [gifs, setGifs] = useState([]);
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadGifs = async () => {
            setLoading(true);
            const gifData = await fetchGifs(query);
            setGifs(gifData);
            setLoading(false);
        };
        const timer = setTimeout(() => loadGifs(), 500);
        return () => clearTimeout(timer);
    }, [query]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg p-4 w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Pesquisar GIFs..."
                    className="w-full bg-gray-700 p-2 rounded-md text-white mb-4"
                />
                <div className="grid grid-cols-3 gap-2 h-80 overflow-y-auto">
                    {loading ? <p className="text-white">Carregando...</p> : gifs.map(gif => (
                        <img key={gif.id} src={gif.images.fixed_height_small.url} onClick={() => onSelect(gif.images.original.url)} className="cursor-pointer" />
                    ))}
                </div>
            </div>
        </div>
    );
};
