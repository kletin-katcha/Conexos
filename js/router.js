// js/router.js

// Importa todos os módulos de página
import { Login } from './modules/login.js';
import { FeedV2 } from './modules/feed.js';
import { Explore } from './modules/explore.js';
import { Comunidade } from './modules/comunidade.js';
import { Notifications } from './modules/notifications.js';
import { Chat } from './modules/chat.js';
import { Game } from './modules/game.js';
import { Profile } from './modules/profile.js';
import { Pagamento } from './modules/pagamento.js';
import { Call } from './modules/call.js';
import { Serve } from './modules/serve.js';

// Mapeia o nome do módulo para o objeto importado
const modules = {
    'login': Login,
    'feed-v2': FeedV2,
    'explore': Explore,
    'comunidade': Comunidade,
    'notifications': Notifications,
    'chat': Chat,
    'game': Game,
    'profile': Profile,
    'pagamento': Pagamento,
    'call': Call,
    'serve': Serve
};

// Mapeamento de rotas para os arquivos de view e módulos JS
const routes = {
    '404': { template: 'views/404.html', module: null },
    '/login': { template: 'views/login.html', module: 'login' },
    '/': { template: 'views/feed.html', module: 'feed-v2', requiresAuth: true },
    '/feed': { template: 'views/feed.html', module: 'feed-v2', requiresAuth: true },
    '/profile': { template: 'views/profile.html', module: 'profile', requiresAuth: true },
    '/chat': { template: 'views/chat.html', module: 'chat', requiresAuth: true },
    '/comunidade': { template: 'views/comunidade.html', module: 'comunidade', requiresAuth: true },
    '/search': { template: 'views/search.html', module: 'explore', requiresAuth: true },
    '/game': { template: 'views/game.html', module: 'game', requiresAuth: true },
    '/notificacoes': { template: 'views/notificacoes.html', module: 'notifications', requiresAuth: true },
    '/pagamento': { template: 'views/pagamento.html', module: 'pagamento', requiresAuth: true },
    '/call': { template: 'views/call.html', module: 'call', requiresAuth: true },
    '/serve': { template: 'views/serve.html', module: 'serve', requiresAuth: true },
    '/ajuda': { template: 'views/ajuda.html', module: null, requiresAuth: true }
};

const router = async () => {
    // Pega o caminho da URL (ex: #/profile?id=123 -> /profile)
    const path = (location.hash.slice(1) || '/').split('?')[0];
    
    // Encontra a rota correspondente ou usa a 404
    const route = routes[path] || routes['404'];
    
    // **LÓGICA DE AUTENTICAÇÃO**
    // Verifica se o usuário está logado olhando o sessionStorage.
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');

    // Se a rota (ex: /feed) precisa de autenticação e o usuário não está logado...
    if (route.requiresAuth && !isLoggedIn) {
        // ...redireciona para a página de login.
        location.hash = '/login';
        return; // Para a execução para o roteador ser chamado novamente com a nova hash.
    }

    // Se o usuário já está logado e tenta acessar a página de login...
    if (path === '/login' && isLoggedIn) {
        // ...redireciona para o feed, que é a página inicial.
        location.hash = '/feed';
        return;
    }

    // Busca o conteúdo HTML da view
    try {
        const response = await fetch(route.template);
        if (!response.ok) throw new Error('Page not found');
        const html = await response.text();
        
        const appContainer = document.getElementById('app-container');
        const sidebarContainer = document.getElementById('sidebar-container');
        const musicPlayerContainer = document.getElementById('music-player-container');


        // Limpa timers e estilos de módulos anteriores para evitar vazamento de memória e conflitos
        if (window.currentModule && typeof window.currentModule.cleanup === 'function') {
            window.currentModule.cleanup();
        }
        
        // Esconde a sidebar e o music player na tela de login e ajusta o layout
        if (path === '/login') {
            sidebarContainer.style.display = 'none';
            if (musicPlayerContainer) musicPlayerContainer.style.display = 'none';
            appContainer.style.marginLeft = '0';
            appContainer.style.width = '100%';
        } else {
            sidebarContainer.style.display = '';
            if (musicPlayerContainer) musicPlayerContainer.style.display = '';
            appContainer.style.marginLeft = '';
            appContainer.style.width = '';
        }

        appContainer.innerHTML = html;

        // Se a rota tem um módulo JS, inicializa ele
        const moduleName = route.module;
        if (moduleName && modules[moduleName] && typeof modules[moduleName].init === 'function') {
            window.currentModule = modules[moduleName]; 
            // Torna o módulo acessível globalmente para debugging, se necessário
            window[moduleName.charAt(0).toUpperCase() + moduleName.slice(1).replace(/-/g, '')] = modules[moduleName];
            modules[moduleName].init();
        } else {
            window.currentModule = null;
        }
        
        // Atualiza o título da página
        const pageTitle = path.slice(1).charAt(0).toUpperCase() + path.slice(2).replace(/-/g, ' ') || 'Feed';
        document.title = `${pageTitle} - Conexos`;

    } catch (error) {
        console.error("Error loading page: ", error);
        // Carrega a página 404 em caso de erro
        const response = await fetch(routes['404'].template);
        document.getElementById('app-container').innerHTML = await response.text();
        document.title = 'Página Não Encontrada - Conexos';
    }
};

// Escuta por mudanças na hash da URL e no carregamento inicial da página
window.addEventListener('hashchange', router);
window.addEventListener('load', router);