// =================================================================================
//  CONECTARE - DYNAMIC COMPONENTS
//  Author: Gemini
//  Description: Functions to dynamically create reusable HTML components
//               like the sidebar and music player.
// =================================================================================

/**
 * Creates the HTML for the sidebar navigation.
 * @param {string} activePage - The name of the currently active page (e.g., 'feed').
 * @returns {string} The sidebar HTML string.
 */
export function createSidebar(activePage) {
    const links = [
        { href: '#/feed', title: 'Início', icon: 'fa-house-chimney', name: 'Início', page: 'feed' },
        { href: '#/search', title: 'Explorar', icon: 'fa-compass', name: 'Explorar', page: 'search' },
        { href: '#/comunidade', title: 'Comunidades', icon: 'fa-users', name: 'Comunidades', page: 'comunidade' },
        { href: '#/notificacoes', title: 'Notificações', icon: 'fa-bell', name: 'Notificações', page: 'notificacoes' },
        { href: '#/chat', title: 'Mensagens', icon: 'fa-paper-plane', name: 'Mensagens', page: 'chat' },
        { href: '#/game', title: 'Jogos', icon: 'fa-gamepad', name: 'Jogos', page: 'game' },
        { href: '#/profile', title: 'Perfil', icon: 'fa-user-astronaut', name: 'Perfil', page: 'profile' }
    ];

    const navLinks = links.map(link => `
        <a href="${link.href}" class="nav-link ${activePage === link.page ? 'active' : ''}" title="${link.title}">
            <i class="fa-solid ${link.icon}"></i>
            <span class="nav-text">${link.name}</span>
        </a>
    `).join('');

    return `
        <aside class="sidebar">
            <div class="sidebar-header">
                <a href="#/feed" class="logo">
                    <i class="fa-solid fa-meteor"></i>
                </a>
            </div>
            <nav class="sidebar-nav">
                ${navLinks}
            </nav>
            <div class="sidebar-footer">
                 <!-- O botão de sair foi removido daqui e centralizado no modal de Configurações do perfil. -->
            </div>
        </aside>
    `;
}

/**
 * Creates the HTML for the music player.
 * @returns {string} The music player HTML string.
 */
export function createMusicPlayer() {
    return `
    <div id="music-player-container">
        <!-- Draggable Icon (Desktop) -->
        <div id="music-player-draggable-icon" class="player-draggable-icon drag-handle hidden">
            <img id="draggable-artwork" src="https://placehold.co/80x80/1e1e1e/white?text=♪" alt="Capa do Álbum">
        </div>

        <!-- Desktop Playlist Panel -->
        <div id="desktop-playlist-panel" class="desktop-playlist-panel hidden">
            <div class="dpp-header">
                <h4>Tocando Agora</h4>
            </div>

            <div class="dpp-now-playing">
                <img id="dpp-artwork" src="https://placehold.co/64x64/1e1e1e/white?text=♪" alt="Capa do Álbum">
                <div class="dpp-track-info">
                    <h3 id="dpp-title">Nenhuma música tocando</h3>
                    <p id="dpp-artist">Selecione uma faixa</p>
                </div>
            </div>
            
            <div class="dpp-controls">
                <button id="dpp-prev-btn" title="Anterior"><i class="fa-solid fa-backward-step"></i></button>
                <button id="dpp-play-pause-btn" title="Play/Pause"><i class="fa-solid fa-play"></i></button>
                <button id="dpp-next-btn" title="Próxima"><i class="fa-solid fa-forward-step"></i></button>
            </div>
            
            <div class="dpp-volume-control">
                <button id="dpp-mute-btn" title="Mudo"><i class="fa-solid fa-volume-high"></i></button>
                <input type="range" id="dpp-volume-slider" min="0" max="1" step="0.01" value="0.5">
            </div>

            <hr class="dpp-divider">

            <div class="dpp-playlist" id="dpp-playlist-container">
                <div class="dpp-playlist-header">
                     <h4>Próximas na Fila</h4>
                     <button id="dpp-toggle-playlist-btn" title="Mostrar/Esconder Lista"><i class="fa-solid fa-chevron-up"></i></button>
                </div>
                <ul id="dpp-playlist-list">
                    <!-- Itens da playlist serão renderizados aqui -->
                </ul>
            </div>
        </div>

        <!-- Player Barra (Mobile) -->
        <div id="music-player-mobile" class="hidden player-bar-mobile">
            <div class="player-bar-track-info" id="expand-player-mobile-btn">
                <img id="mobile-artwork" src="https://placehold.co/64x64/1e1e1e/white?text=♪" alt="Capa do Álbum">
                <div class="player-bar-text">
                    <h4 id="mobile-title">Nenhuma música tocando</h4>
                    <p id="mobile-artist">Selecione uma faixa</p>
                </div>
            </div>
            <div class="player-bar-controls-mobile">
                <button id="mobile-prev-btn" title="Anterior"><i class="fa-solid fa-backward-step"></i></button>
                <button id="mobile-play-pause-btn" title="Play/Pause"><i class="fa-solid fa-play"></i></button>
                <button id="mobile-next-btn" title="Próxima"><i class="fa-solid fa-forward-step"></i></button>
            </div>
        </div>

        <!-- Player Remake: Fullscreen "Now Playing" Modal (Mobile) -->
        <div id="music-player-fullscreen" class="hidden">
            <div id="fullscreen-bg-blur"></div>
            <div class="fullscreen-player-content">
                <div class="fullscreen-header">
                     <button id="collapse-player-btn" title="Minimizar"><i class="fa-solid fa-chevron-down"></i></button>
                     <span>Tocando Agora</span>
                     <div>
                        <button id="fullscreen-playlist-btn" title="Playlist"><i class="fa-solid fa-list-ol"></i></button>
                     </div>
                </div>
                <div class="fullscreen-main">
                    <div class="fullscreen-artwork-wrapper">
                        <img id="fullscreen-artwork" src="https://placehold.co/400x400/1e1e1e/white?text=♪" alt="Capa do Álbum">
                    </div>
                    <div class="fullscreen-track-details">
                        <h2 id="fullscreen-title">Selecione uma música</h2>
                        <h3 id="fullscreen-artist">Artista Desconhecido</h3>
                    </div>
                    <div class="progress-container-fullscreen">
                        <span id="fullscreen-current-time">0:00</span>
                        <input type="range" id="fullscreen-progress-bar" value="0" step="1" min="0">
                        <span id="fullscreen-total-duration">0:00</span>
                    </div>
                    <div class="player-controls-fullscreen">
                        <button id="fullscreen-prev-btn"><i class="fa-solid fa-backward-step"></i></button>
                        <button id="fullscreen-play-pause-btn"><i class="fa-solid fa-play"></i></button>
                        <button id="fullscreen-next-btn"><i class="fa-solid fa-forward-step"></i></button>
                    </div>
                </div>
            </div>
            <div id="fullscreen-playlist-view" class="hidden">
                <h4>Próximas na Fila</h4>
                <ul id="fullscreen-playlist-list"><!-- Playlist items here --></ul>
            </div>
        </div>

        <audio id="audio-element"></audio>

        <!-- Modal de busca do Spotify removido daqui -->
    </div>
    `;
}