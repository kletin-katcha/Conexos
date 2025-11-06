import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../services/firebase';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { mockGames } from '../data/mock';

export default function Jogos({ onNavigate }) {
    const { user } = useAuth();
    const [selectedGame, setSelectedGame] = useState(null);

    const handleBuyGame = async (gameId) => {
        const userDocRef = doc(db, 'users', user.auth.uid);
        await updateDoc(userDocRef, {
            ownedGames: arrayUnion(gameId)
        });
        // Idealmente, aqui teríamos uma navegação para a página de sucesso
        // ou um feedback visual. Por enquanto, apenas atualizamos o DB.
        alert(`Jogo ${gameId} "comprado" e adicionado ao seu perfil!`);
        onNavigate('perfil');
    };

    if (selectedGame) {
        return (
            <div className="h-full flex flex-col">
                <div className="p-4 bg-gray-800 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-yellow-400">{selectedGame.name}</h2>
                    <button onClick={() => setSelectedGame(null)} className="text-white hover:text-yellow-300">
                        <i className="fas fa-times text-2xl"></i>
                    </button>
                </div>
                <iframe src={selectedGame.src} className="w-full h-full border-0"></iframe>
            </div>
        );
    }

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-yellow-400 mb-6">Conexo Play</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockGames.map(game => (
                    <div key={game.id} className="bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700">
                        <img src={game.image} alt={game.name} className="w-full h-48 object-cover" />
                        <div className="p-4">
                            <h3 className="text-xl font-bold">{game.name}</h3>
                            <p className="text-yellow-400 mt-1">{game.price}</p>
                            <div className="mt-4 flex space-x-2">
                                <button onClick={() => setSelectedGame(game)} className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold py-2 px-4 rounded transition-colors">
                                    Jogar
                                </button>
                                <button onClick={() => handleBuyGame(game.id)} className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded transition-colors">
                                    Comprar
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
