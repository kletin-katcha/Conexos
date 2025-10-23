import { createSidebar, createMusicPlayer } from './modules/components.js';
// import { getAccessToken } from './modules/spotify-config.js'; // Removido

// --- INICIALIZAÇÃO GLOBAL ---

document.addEventListener('DOMContentLoaded', () => {
    // Injeta os componentes reutilizáveis
    const sidebarContainer = document.getElementById('sidebar-container');
    const musicPlayerContainer = document.getElementById('music-player-container');

    const page = location.hash.slice(2).split('?')[0] || 'feed';
    if (sidebarContainer) {
        sidebarContainer.innerHTML = createSidebar(page);
    }
    if (musicPlayerContainer) {
        musicPlayerContainer.innerHTML = createMusicPlayer();
    }

    // Inicializa os módulos globais que rodam em todas as páginas
    ThemeManager.init();
    ProfileCustomizer.init();
    MusicPlayer.init();
    EventManager.init();

    // Atualiza a sidebar no hashchange para marcar o link ativo
    window.addEventListener('hashchange', () => {
         if (sidebarContainer) {
            const newPage = location.hash.slice(2).split('?')[0] || 'feed';
            sidebarContainer.innerHTML = createSidebar(newPage);
        }
    });
    
    // Inicia o roteador APÓS garantir que tudo na DOM está carregado
    import('./router.js');
});


// =================================
//  GERENCIADOR DE TEMA (ATUALIZADO)
// =================================
const ThemeManager = {
    init() {
        this.loadTheme();

        // Usa "delegação de eventos" para capturar a mudança no novo switch
        document.body.addEventListener('change', (e) => {
            const toggleSwitch = e.target.closest('#theme-toggle-switch');
            if (toggleSwitch) {
                this.setTheme(toggleSwitch.checked ? 'light-theme' : 'dark-theme');
            }
        });
    },

    setTheme(themeName) {
        // Salva a escolha do usuário no armazenamento local e aplica a classe ao HTML
        localStorage.setItem('theme', themeName);
        document.documentElement.className = themeName;
    },

    loadTheme() {
        const storedTheme = localStorage.getItem('theme') || 'dark-theme';
        document.documentElement.className = storedTheme;
        // O estado visual do switch é atualizado quando o modal de configurações é aberto (ver profile.js)
    },
    
    updateToggleState() {
        const toggleSwitch = document.getElementById('theme-toggle-switch');
        if (toggleSwitch) {
            const currentTheme = localStorage.getItem('theme') || 'dark-theme';
            toggleSwitch.checked = currentTheme === 'light-theme';
        }
    }
};

// Torna o ThemeManager acessível globalmente para que outros módulos (como profile.js) possam usá-lo.
window.ThemeManager = ThemeManager;


// =================================
//  CUSTOMIZADOR DE PERFIL
// =================================
const ProfileCustomizer = {
    init() {
        this.applyCustomAccentColor();
    },

    applyCustomAccentColor() {
        const accentColor = sessionStorage.getItem('accentColor');
        
        let styleTag = document.getElementById('custom-accent-style');
        if (!styleTag) {
            styleTag = document.createElement('style');
            styleTag.id = 'custom-accent-style';
            document.head.appendChild(styleTag);
        }
        
        if (accentColor) {
            const adjustColor = (color, amount) => {
                return '#' + color.replace(/^#/, '').replace(/../g, c => ('0'+Math.min(255, Math.max(0, parseInt(c, 16) + amount)).toString(16)).substr(-2));
            };

            const accentHoverColor = adjustColor(accentColor, 30);

            const hexToRgb = (hex) => {
                const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : null;
            }
            
            const accentRgb = hexToRgb(accentColor);

            styleTag.innerHTML = `
                :root {
                    --user-accent-color: ${accentColor};
                    --user-accent-hover-color: ${accentHoverColor};
                    --user-accent-rgb: ${accentRgb};
                }
            `;
        } else {
            styleTag.innerHTML = '';
        }
    }
};

window.ProfileCustomizer = ProfileCustomizer;


// =================================
//  MUSIC PLAYER
// =================================
const MusicPlayer = {
    isInitialized: false,
    isPlaying: false,
    isPanelOpen: false, 
    isPlaylistVisible: false, 
    currentTrackIndex: 0,
    playlist: [
        { title: "Caramel", artist: "Aventure", src: "https://www.bensound.com/bensound-music/bensound-memories.mp3", artwork: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=400&auto=format&fit=crop" },
        { title: "Orange Clouds", artist: "Aventure (Bensound)", src: "https://www.bensound.com/bensound-music/bensound-orangeclouds.mp3", artwork: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=400&auto=format&fit=crop" },
        { title: "The Sunday", artist: "Melatone (Bensound)", src: "https://www.bensound.com/bensound-music/bensound-thesunday.mp3", artwork: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=400&auto=format&fit=crop" },
        { title: "Creative Minds", artist: "Bensound", src: "https://www.bensound.com/bensound-music/bensound-creativeminds.mp3", artwork: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=400&auto=format&fit=crop" }
    ],
    isSeeking: false,
    isDragging: false,
    didDrag: false, 
    dragOffsetX: 0,
    dragOffsetY: 0,
    currentVolume: 0.5,

    init() {
        if (!document.getElementById('audio-element') || this.isInitialized) {
            if(this.isInitialized) this.cacheDOMElements();
            return;
        };
        this.isInitialized = true;

        this.cacheDOMElements();
        this.addEventListeners();
        this.loadTrack(this.currentTrackIndex, false);
        this.renderPlaylist();
        this.audio.volume = this.currentVolume;
        if (this.dppVolumeSlider) this.dppVolumeSlider.value = this.currentVolume;
        this.updatePlayerVisibility();
        this.updateVolumeIcon();
    },

    cacheDOMElements() {
        this.audio = document.getElementById('audio-element');
        this.musicPlayerContainer = document.getElementById('music-player-container');
        
        this.playerDraggableIcon = document.getElementById('music-player-draggable-icon');
        this.draggableArtwork = document.getElementById('draggable-artwork');
        this.desktopPlaylistPanel = document.getElementById('desktop-playlist-panel');
        this.dppArtwork = document.getElementById('dpp-artwork');
        this.dppTitle = document.getElementById('dpp-title');
        this.dppArtist = document.getElementById('dpp-artist');
        this.dppPrevBtn = document.getElementById('dpp-prev-btn');
        this.dppPlayPauseBtn = document.getElementById('dpp-play-pause-btn');
        this.dppNextBtn = document.getElementById('dpp-next-btn');
        this.dppPlaylistContainer = document.getElementById('dpp-playlist-container');
        this.dppTogglePlaylistBtn = document.getElementById('dpp-toggle-playlist-btn');
        this.dppPlaylistList = document.getElementById('dpp-playlist-list');
        this.dppMuteBtn = document.getElementById('dpp-mute-btn');
        this.dppVolumeSlider = document.getElementById('dpp-volume-slider');
        this.dragHandle = this.playerDraggableIcon;

        this.playerBarMobile = document.getElementById('music-player-mobile');
        this.mobileArtwork = document.getElementById('mobile-artwork');
        this.mobileTitle = document.getElementById('mobile-title');
        this.mobileArtist = document.getElementById('mobile-artist');
        this.mobilePrevBtn = document.getElementById('mobile-prev-btn');
        this.mobilePlayPauseBtn = document.getElementById('mobile-play-pause-btn');
        this.mobileNextBtn = document.getElementById('mobile-next-btn');
        this.expandPlayerMobileBtn = document.getElementById('expand-player-mobile-btn');
        
        this.fullscreenPlayer = document.getElementById('music-player-fullscreen');
        this.fullscreenBg = document.getElementById('fullscreen-bg-blur');
        this.collapsePlayerBtn = document.getElementById('collapse-player-btn');
        this.fullscreenArtwork = document.getElementById('fullscreen-artwork');
        this.fullscreenTitle = document.getElementById('fullscreen-title');
        this.fullscreenArtist = document.getElementById('fullscreen-artist');
        this.fullscreenProgressBar = document.getElementById('fullscreen-progress-bar');
        this.fullscreenCurrentTime = document.getElementById('fullscreen-current-time');
        this.fullscreenTotalDuration = document.getElementById('fullscreen-total-duration');
        this.fullscreenPrevBtn = document.getElementById('fullscreen-prev-btn');
        this.fullscreenPlayPauseBtn = document.getElementById('fullscreen-play-pause-btn');
        this.fullscreenNextBtn = document.getElementById('fullscreen-next-btn');
        this.fullscreenPlaylistBtn = document.getElementById('fullscreen-playlist-btn');
        this.fullscreenPlaylistView = document.getElementById('fullscreen-playlist-view');
        this.fullscreenPlaylistList = document.getElementById('fullscreen-playlist-list');
    },

    addEventListeners() {
        [this.dppPlayPauseBtn, this.mobilePlayPauseBtn, this.fullscreenPlayPauseBtn].forEach(btn => btn?.addEventListener('click', (e) => { e.stopPropagation(); this.togglePlayPause(); }));
        [this.dppNextBtn, this.mobileNextBtn, this.fullscreenNextBtn].forEach(btn => btn?.addEventListener('click', (e) => { e.stopPropagation(); this.nextTrack(); }));
        [this.dppPrevBtn, this.mobilePrevBtn, this.fullscreenPrevBtn].forEach(btn => btn?.addEventListener('click', (e) => { e.stopPropagation(); this.prevTrack(); }));
        this.fullscreenProgressBar?.addEventListener('input', e => this.seekToTime(e.target.value));
        this.dppVolumeSlider?.addEventListener('input', e => this.setVolume(e.target.value));
        this.dppMuteBtn?.addEventListener('click', () => this.toggleMute());
        this.audio.addEventListener('timeupdate', () => this.updateProgress());
        this.audio.addEventListener('loadedmetadata', () => this.updateDuration());
        this.audio.addEventListener('ended', () => this.nextTrack());
        this.audio.addEventListener('play', () => { this.isPlaying = true; this.updatePlayPauseIcons(); });
        this.audio.addEventListener('pause', () => { this.isPlaying = false; this.updatePlayPauseIcons(); });
        this.audio.addEventListener('volumechange', () => this.updateVolumeIcon());
        this.expandPlayerMobileBtn?.addEventListener('click', (e) => { e.stopPropagation(); this.togglePanel(true); });
        this.collapsePlayerBtn?.addEventListener('click', () => this.togglePanel(false));
        this.fullscreenPlayer?.addEventListener('click', e => { if (e.target === this.fullscreenPlayer) this.togglePanel(false); });
        this.fullscreenPlaylistBtn?.addEventListener('click', () => this.togglePlaylist());
        this.dppTogglePlaylistBtn?.addEventListener('click', (e) => { e.stopPropagation(); this.toggleDesktopPlaylist(); });
        if (this.dragHandle) {
            this.dragHandle.addEventListener('mousedown', this.startDrag.bind(this));
            this.dragHandle.addEventListener('touchstart', this.startDrag.bind(this), { passive: false });
        }
        window.addEventListener('resize', () => this.updatePlayerVisibility());
    },

    startDrag(e) {
        e.preventDefault();
        this.didDrag = false;
        this.isDragging = true;
        const event = e.touches ? e.touches[0] : e;
        const rect = this.playerDraggableIcon.getBoundingClientRect();
        this.dragOffsetX = event.clientX - rect.left;
        this.dragOffsetY = event.clientY - rect.top;
        this.playerDraggableIcon.style.transition = 'none';
        this.desktopPlaylistPanel.style.transition = 'none';
        this.playerDraggableIcon.style.cursor = 'grabbing';
        this.boundDrag = this.drag.bind(this);
        this.boundEndDrag = this.endDrag.bind(this);
        document.addEventListener('mousemove', this.boundDrag);
        document.addEventListener('mouseup', this.boundEndDrag);
        document.addEventListener('touchmove', this.boundDrag, { passive: false });
        document.addEventListener('touchend', this.boundEndDrag);
    },

    drag(e) {
        if (!this.isDragging) return;
        e.preventDefault();
        this.didDrag = true;
        const event = e.touches ? e.touches[0] : e;
        let newX = event.clientX - this.dragOffsetX;
        let newY = event.clientY - this.dragOffsetY;
        const iconWidth = this.playerDraggableIcon.offsetWidth;
        const iconHeight = this.playerDraggableIcon.offsetHeight;
        newX = Math.max(0, Math.min(newX, window.innerWidth - iconWidth));
        newY = Math.max(0, Math.min(newY, window.innerHeight - iconHeight));
        this.playerDraggableIcon.style.left = `${newX}px`;
        this.playerDraggableIcon.style.top = `${newY}px`;
        this.playerDraggableIcon.style.right = 'auto';
        this.playerDraggableIcon.style.bottom = 'auto';
        this.positionDesktopPanel();
    },

    endDrag() {
        if (!this.isDragging) return;
        this.isDragging = false;
        if (!this.didDrag) this.toggleDesktopPanel();
        this.playerDraggableIcon.style.transition = '';
        this.desktopPlaylistPanel.style.transition = '';
        this.playerDraggableIcon.style.cursor = 'grab';
        document.removeEventListener('mousemove', this.boundDrag);
        document.removeEventListener('mouseup', this.boundEndDrag);
        document.removeEventListener('touchmove', this.boundDrag);
        document.removeEventListener('touchend', this.boundEndDrag);
    },

    updatePlayerVisibility() {
        const isMobile = window.innerWidth <= 768;
        this.playerDraggableIcon.classList.toggle('hidden', isMobile);
        if(!isMobile && !this.desktopPlaylistPanel.classList.contains('hidden')) {
            // Do not hide if it should be open
        } else {
            this.desktopPlaylistPanel.classList.toggle('hidden', isMobile);
        }
        this.playerBarMobile.classList.toggle('hidden', !isMobile);
    },
    
    positionDesktopPanel() {
        const iconRect = this.playerDraggableIcon.getBoundingClientRect();
        const panel = this.desktopPlaylistPanel;
        if (!panel) return;
        panel.style.top = 'auto';
        panel.style.bottom = 'auto';
        panel.style.left = 'auto';
        panel.style.right = 'auto';
        if (iconRect.top + (iconRect.height / 2) > window.innerHeight / 2) panel.style.bottom = `${window.innerHeight - iconRect.top + 10}px`;
        else panel.style.top = `${iconRect.bottom + 10}px`;
        if (iconRect.left + (iconRect.width / 2) > window.innerWidth / 2) panel.style.right = `${window.innerWidth - iconRect.right}px`;
        else panel.style.left = `${iconRect.left}px`;
    },

    toggleDesktopPanel(forceState) {
        const shouldBeVisible = forceState !== undefined ? forceState : this.desktopPlaylistPanel.classList.contains('hidden');
        if (shouldBeVisible) this.positionDesktopPanel();
        this.desktopPlaylistPanel.classList.toggle('hidden', !shouldBeVisible);
    },

    toggleDesktopPlaylist() { this.dppPlaylistContainer?.classList.toggle('playlist-collapsed'); },
    togglePanel(open) { this.isPanelOpen = open; this.fullscreenPlayer.classList.toggle('hidden', !open); if(!open) { this.isPlaylistVisible = false; if(this.fullscreenPlaylistView) this.fullscreenPlaylistView.classList.remove('visible'); } },
    togglePlaylist() { this.isPlaylistVisible = !this.isPlaylistVisible; if(this.fullscreenPlaylistView) this.fullscreenPlaylistView.classList.toggle('visible', this.isPlaylistVisible); },
    togglePlayPause() { if (this.audio.src && this.audio.src !== window.location.href) { this.audio.paused ? this.audio.play() : this.audio.pause(); } else { this.loadTrack(0, true); } },

    updatePlayPauseIcons() {
        const iconClass = this.isPlaying ? 'fa-solid fa-pause' : 'fa-solid fa-play';
        if (this.dppPlayPauseBtn) this.dppPlayPauseBtn.querySelector('i').className = iconClass;
        if (this.mobilePlayPauseBtn) this.mobilePlayPauseBtn.querySelector('i').className = iconClass;
        if (this.fullscreenPlayPauseBtn) this.fullscreenPlayPauseBtn.querySelector('i').className = iconClass;
    },

    loadTrack(index, shouldPlay = true) {
        this.currentTrackIndex = index;
        const track = this.playlist[index];
        this.audio.src = track.src;
        this.updateAllUI(track);
        if (shouldPlay) this.audio.play().catch(e => console.error("Playback failed", e));
    },

    updateAllUI(track) {
        if (this.draggableArtwork) this.draggableArtwork.src = track.artwork;
        if (this.dppArtwork) this.dppArtwork.src = track.artwork;
        if (this.dppTitle) this.dppTitle.textContent = track.title;
        if (this.dppArtist) this.dppArtist.textContent = track.artist;
        if (this.mobileArtwork) this.mobileArtwork.src = track.artwork;
        if (this.mobileTitle) this.mobileTitle.textContent = track.title;
        if (this.mobileArtist) this.mobileArtist.textContent = track.artist;
        if (this.fullscreenArtwork) this.fullscreenArtwork.src = track.artwork;
        if (this.fullscreenTitle) this.fullscreenTitle.textContent = track.title;
        if (this.fullscreenArtist) this.fullscreenArtist.textContent = track.artist;
        if (this.fullscreenBg) this.fullscreenBg.style.backgroundImage = `url(${track.artwork})`;
        this.updatePlaylistUI();
    },

    nextTrack() { this.loadTrack((this.currentTrackIndex + 1) % this.playlist.length, this.isPlaying); },
    prevTrack() { this.loadTrack((this.currentTrackIndex - 1 + this.playlist.length) % this.playlist.length, this.isPlaying); },
    seekToTime(value) { if(this.audio.duration) this.audio.currentTime = value; },
    setVolume(value) { this.audio.volume = value; this.currentVolume = value; if (value > 0) this.audio.muted = false; },
    toggleMute() { this.audio.muted = !this.audio.muted; if (!this.audio.muted && this.audio.volume === 0) { this.setVolume(this.currentVolume > 0 ? this.currentVolume : 0.5); if (this.dppVolumeSlider) this.dppVolumeSlider.value = this.audio.volume; } },

    updateVolumeIcon() {
        const icon = this.dppMuteBtn?.querySelector('i');
        if (!icon) return;
        if (this.audio.muted || this.audio.volume === 0) icon.className = 'fa-solid fa-volume-xmark';
        else if (this.audio.volume < 0.5) icon.className = 'fa-solid fa-volume-low';
        else icon.className = 'fa-solid fa-volume-high';
    },

    updateProgress() {
        if (this.audio.duration && !this.isSeeking) if(this.fullscreenProgressBar) this.fullscreenProgressBar.value = this.audio.currentTime;
        if(this.fullscreenCurrentTime) this.fullscreenCurrentTime.textContent = this.formatTime(this.audio.currentTime);
    },

    updateDuration() {
        if (this.audio.duration) {
            if(this.fullscreenTotalDuration) this.fullscreenTotalDuration.textContent = this.formatTime(this.audio.duration);
            if(this.fullscreenProgressBar) this.fullscreenProgressBar.max = this.audio.duration;
        }
    },
    
    formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${String(secs).padStart(2, '0')}`;
    },

    renderPlaylist() {
        [this.dppPlaylistList, this.fullscreenPlaylistList].forEach(list => {
            if (!list) return;
            list.innerHTML = '';
            this.playlist.forEach((track, index) => {
                const li = document.createElement('li');
                li.dataset.index = index;
                li.innerHTML = `<span>${track.title}</span><small>${track.artist}</small>`;
                li.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.loadTrack(index);
                    if (this.fullscreenPlaylistView) this.fullscreenPlaylistView.classList.remove('visible');
                });
                list.appendChild(li);
            });
        });
        this.updatePlaylistUI();
    },

    updatePlaylistUI() {
        [this.dppPlaylistList, this.fullscreenPlaylistList].forEach(list => {
            if (!list) return;
            list.querySelectorAll('li').forEach(li => li.classList.toggle('playing', parseInt(li.dataset.index) === this.currentTrackIndex));
        });
    },

    closeModal(modal) {
        if(modal) modal.classList.add('hidden');
    }
};

window.MusicPlayer = MusicPlayer;

// =================================
//  GERENCIADOR DE EVENTOS DINÂMICOS
// =================================
const EventManager = {
    eventInterval: null,
    simulatedEvents: [
        {
            type: 'live_event',
            user: 'Carlos Souza',
            avatar: 'https://i.pinimg.com/736x/32/b5/17/32b51754e1496531c11a027c9a185d24.jpg',
            image: 'https://cdn.akamai.steamstatic.com/steam/apps/2778580/capsule_616x353.jpg?t=1708533808',
            title: 'AO VIVO: Zerando o novo Elden Ring!',
            message: 'iniciou uma transmissão: Zerando o novo Elden Ring!',
            actionBtn: { text: 'Assistir', class: 'btn-primary', action: 'view-profile' }
        },
        {
            type: 'live_event',
            community: 'Devs & Café',
            avatar: 'https://i.pinimg.com/736x/e3/19/36/e31936c2ffddedc3123b0ae87e916cb4.jpg',
            image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=800&auto=format&fit=crop',
            title: 'AO VIVO: Q&A com a moderação!',
            message: 'está ao vivo: Q&A com a moderação!',
            actionBtn: { text: 'Participar', class: 'btn-primary', action: 'view-community' }
        }
    ],

    init() {
        setTimeout(() => {
            this.startEventGenerator();
        }, 15000);
    },

    startEventGenerator() {
        this.eventInterval = setInterval(() => {
            this.triggerRandomEvent();
        }, 30000);
    },

    triggerRandomEvent() {
        const eventData = this.simulatedEvents[Math.floor(Math.random() * this.simulatedEvents.length)];
        
        if (window.Notifications) {
            const notificationData = {
                type: eventData.type,
                user: eventData.user || eventData.community,
                avatar: eventData.avatar,
                message: eventData.message,
                actionBtn: eventData.actionBtn
            };
            window.Notifications.addNotification(notificationData);
        }

        if (window.Explore && window.location.hash.includes('#/search')) {
             const signalData = {
                type: 'live_event',
                user: eventData.user,
                name: eventData.community,
                avatar: eventData.avatar,
                image: eventData.image,
                title: eventData.title,
                isLive: true
            };
            window.Explore.addLiveEventSignal(signalData);
        }
    }
};