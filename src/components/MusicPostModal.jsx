import { useState } from 'react';
import { getSpotifyAccessToken } from '../services/spotify';

export default function MusicPostModal({ onPost, onClose }) {
    const [url, setUrl] = useState('');
    const [trackData, setTrackData] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleFetchTrack = async () => {
        const trackId = url.split('track/')[1]?.split('?')[0];
        if (!trackId) return;

        setLoading(true);
        const token = await getSpotifyAccessToken();
        const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        setTrackData(data);
        setLoading(false);
    };

    const handlePost = () => {
        onPost({
            type: 'music',
            embedUrl: `https://open.spotify.com/embed/track/${trackData.id}`,
            title: trackData.name,
            artist: trackData.artists.map(a => a.name).join(', '),
            artwork: trackData.album.images[0].url,
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold mb-4">Adicionar Música do Spotify</h3>
                <div className="flex space-x-2">
                    <input type="text" value={url} onChange={e => setUrl(e.target.value)} placeholder="Cole o link da música do Spotify" className="flex-1 bg-gray-700 p-2 rounded-md text-white" />
                    <button onClick={handleFetchTrack} className="bg-green-500 hover:bg-green-400 px-4 rounded-md font-bold">{loading ? '...' : 'Buscar'}</button>
                </div>
                {trackData && (
                    <div className="mt-4 text-center">
                        <img src={trackData.album.images[0].url} className="w-32 h-32 mx-auto rounded-md" />
                        <p className="font-bold mt-2">{trackData.name}</p>
                        <p className="text-gray-400">{trackData.artists.map(a => a.name).join(', ')}</p>
                        <button onClick={handlePost} className="w-full bg-cyan-500 hover:bg-cyan-400 text-white font-bold py-2 px-4 rounded-lg mt-4">
                            Postar Música
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
