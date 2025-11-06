import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';

import AuthScreen from './pages/AuthScreen';
import Sidebar from './components/Sidebar';
import Feed from './pages/Feed';
import Chat from './pages/Chat';
import Comunidades from './pages/Comunidades';
import Perfil from './pages/Perfil';
import Jogos from './pages/Jogos';
import Pagamento from './pages/Pagamento';
import Notificacoes from './pages/Notificacoes';

function App() {
    const { user } = useAuth();
    const [route, setRoute] = useState('feed');

    if (!user) {
        return <AuthScreen />;
    }

    const renderRoute = () => {
        switch (route) {
            case 'feed': return <Feed />;
            case 'chat': return <Chat />;
            case 'comunidades': return <Comunidades />;
            case 'perfil': return <Perfil />;
            case 'jogos': return <Jogos onNavigate={setRoute} />;
            case 'pagamento': return <Pagamento />;
            case 'notificacoes': return <Notificacoes />;
            default: return <Feed />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-900 text-white font-sans">
            <Sidebar route={route} setRoute={setRoute} />
            <main className="flex-1 overflow-y-auto">
                {renderRoute()}
            </main>
        </div>
    );
}

export default App;
