import { useAuth } from '../contexts/AuthContext';

const navLinks = [
    { name: 'feed', icon: 'fa-solid fa-house-chimney' },
    { name: 'comunidades', icon: 'fa-solid fa-users' },
    { name: 'chat', icon: 'fa-solid fa-comments' },
    { name: 'jogos', icon: 'fa-solid fa-gamepad' },
    { name: 'perfil', icon: 'fa-solid fa-user' },
    { name: 'notificacoes', icon: 'fa-solid fa-bell' },
];

export default function Sidebar({ route, setRoute }) {
    const { logout } = useAuth();

    return (
        <nav className="w-20 bg-gray-800 p-4 flex flex-col items-center justify-between">
            <div>
                <div className="text-cyan-400 text-3xl mb-10">
                    <i className="fa-solid fa-atom"></i>
                </div>
                <ul className="space-y-6">
                    {navLinks.map(link => (
                        <li key={link.name}>
                            <button
                                onClick={() => setRoute(link.name)}
                                className={`text-2xl ${route === link.name ? 'text-cyan-400' : 'text-gray-400'} hover:text-cyan-300 transition-colors duration-200`}
                                title={link.name.charAt(0).toUpperCase() + link.name.slice(1)}
                            >
                                <i className={link.icon}></i>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
            <div>
                <button onClick={logout} className="text-2xl text-gray-400 hover:text-red-500 transition-colors duration-200" title="Sair">
                    <i className="fa-solid fa-right-from-bracket"></i>
                </button>
            </div>
        </nav>
    );
};
