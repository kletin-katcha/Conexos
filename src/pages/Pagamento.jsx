export default function Pagamento() {
    return (
        <div className="p-8 max-w-lg mx-auto">
            <h1 className="text-3xl font-bold text-green-400 mb-6">Pagamento</h1>
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <form className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300">Número do Cartão</label>
                        <input type="text" placeholder="**** **** **** ****" className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-300">Nome no Cartão</label>
                        <input type="text" placeholder="Seu Nome Completo" className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white" />
                    </div>
                    <div className="flex space-x-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-300">Validade (MM/AA)</label>
                            <input type="text" placeholder="MM/AA" className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white" />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-300">CVV</label>
                            <input type="text" placeholder="***" className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white" />
                        </div>
                    </div>
                    <button type="submit" className="w-full bg-green-500 hover:bg-green-400 text-white font-bold py-3 px-4 rounded-lg transition-colors mt-6">
                        Finalizar Compra
                    </button>
                </form>
            </div>
        </div>
    );
};
