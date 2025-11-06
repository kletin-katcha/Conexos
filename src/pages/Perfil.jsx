import { useAuth } from '../contexts/AuthContext';

export default function Perfil() {
    const { user } = useAuth();

    if (!user || !user.profile) {
        return <div className="p-8 text-center">Carregando perfil...</div>
    }

    const { profile } = user;

    return (
        <div className="p-8 max-w-4xl mx-auto text-white">
            <div className="bg-gray-800 rounded-lg shadow-lg p-6 flex items-center space-x-6 border border-gray-700">
                <img src={profile.avatar} alt="Avatar" className="w-32 h-32 rounded-full border-4 border-lime-400" />
                <div>
                    <h1 className="text-4xl font-bold">{profile.name}</h1>
                    <p className="text-gray-400 mt-2">{profile.bio}</p>
                </div>
            </div>
            <div className="mt-8">
                <h2 className="text-2xl font-bold text-lime-400 mb-4">Jogos Adquiridos</h2>
                {profile.ownedGames && profile.ownedGames.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {profile.ownedGames.map(gameId => (
                            <div key={gameId} className="bg-gray-800 rounded-lg p-4 text-center shadow-lg border border-gray-700 hover:border-lime-400 transition-colors">
                                <i className="fas fa-gamepad text-4xl text-lime-400 mb-2"></i>
                                <h3 className="text-xl font-semibold capitalize">{gameId}</h3>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-400">Você ainda não possui jogos. Visite a Conexo Play!</p>
                )}
            </div>
        </div>
    );
};
