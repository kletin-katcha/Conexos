export default function ChatMessage({ message }) {
    const isGif = message.text && message.text.startsWith('https') && message.text.endsWith('.gif');

    return (
        <div className="flex items-start space-x-4 p-4 hover:bg-gray-800 transition-colors duration-150">
            <img src={message.avatar} alt="Avatar" className="w-10 h-10 rounded-full" />
            <div className="flex-1">
                <div className="flex items-baseline space-x-2">
                    <p className="font-bold text-cyan-300">{message.user}</p>
                    <p className="text-xs text-gray-500">Hoje às 14:30</p>
                </div>
                {isGif ? (
                    <img src={message.text} alt="GIF" className="mt-2 rounded-lg max-w-xs" />
                ) : (
                    <p className="text-gray-300 font-mono text-sm">{message.text}</p>
                )}
            </div>
        </div>
    );
};
