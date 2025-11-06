import { mockNotifications } from '../data/mock';

export default function Notificacoes() {
    return (
         <div className="p-8 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-indigo-400 mb-6">Notificações</h1>
            <div className="bg-gray-800 rounded-lg border border-gray-700">
                <ul className="divide-y divide-gray-700">
                    {mockNotifications.map(n => (
                        <li key={n.id} className="p-4 flex items-center justify-between hover:bg-gray-700/50">
                            <p className="text-gray-300">{n.text}</p>
                            <span className="text-sm text-gray-500">{n.time}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};
