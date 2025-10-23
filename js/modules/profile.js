// =================================
//  MÓDULO DE LÓGICA DO PERFIL (REMAKE PAINEL DO EXPLORADOR)
// =================================
import { storeGamesData } from './gamedata.js';

export const Profile = {
    
    // --- Dados Simulados ---
    userPosts: [
        { id: 'post-1', image: 'https://i.pinimg.com/736x/a5/67/55/a56755ecbf8a221e4c7251cceb57f0aa.jpg', likes: 1200, comments: 45 },
        { id: 'post-2', image: 'https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?q=80&w=400&auto=format&fit=fit', likes: 890, comments: 32 },
        { id: 'post-3', image: 'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?q=80&w=400&auto=format&fit=fit', likes: 2100, comments: 98 },
        { id: 'post-4', image: 'https://images.unsplash.com/photo-1543373014-cfe4f4bc1cdf?q=80&w=800&auto=format&fit=crop', likes: 1530, comments: 88 },
        { id: 'post-5', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop', likes: 450, comments: 23 },
    ],
    inventory: [
        { id: 'inv-1', icon: 'fa-computer', name: 'PC Gamer', desc: 'RTX 4090 / i9-13900K' },
        { id: 'inv-2', icon: 'fa-headset', name: 'Headset Pro', desc: 'Áudio 7.1 Surround' },
        { id: 'inv-3', icon: 'fa-keyboard', name: 'Teclado Mecânico', desc: 'Switches Red' },
        { id: 'inv-4', icon: 'fa-gamepad', name: 'Controle', desc: 'Edição Limitada' },
    ],
    achievements: [
        { id: 'ach-1', icon: 'fa-user-plus', title: 'Conectado', description: 'Fez sua primeira conexão.', unlocked: true },
        { id: 'ach-2', icon: 'fa-pen-to-square', title: 'Pena de Ouro', description: 'Publicou 10 posts.', unlocked: true },
        { id: 'ach-3', icon: 'fa-heart', title: 'Coração Valente', description: 'Curtiu 50 posts.', unlocked: true },
        { id: 'ach-4', icon: 'fa-users', title: 'Líder de Comunidade', description: 'Criou sua primeira comunidade.', unlocked: false },
        { id: 'ach-5', icon: 'fa-gamepad', title: 'Gamer Nato', description: 'Jogou 5 jogos na plataforma.', unlocked: true },
        { id: 'ach-6', icon: 'fa-star', title: 'Explorador Estelar', description: 'Visitou todas as seções da Conexo.', unlocked: false },
    ],
    storeGames: storeGamesData,
    ownedGames: [],
    followers: 4521, // Dado simulado

    // --- Inicialização ---
    init() {
        if (!document.querySelector('.content-profile')) return;
        this.cacheDOMElements();
        this.loadInitialData();
        this.addEventListeners();
        this.renderAllContent();
    },

    cacheDOMElements() {
        // Triggers Principais
        this.editBannerTrigger = document.getElementById('edit-banner-trigger');
        this.editPicTrigger = document.getElementById('edit-pic-trigger');
        
        // Inputs de Upload (Ocultos)
        this.bannerUploadInput = document.getElementById('banner-upload-input');
        this.profilePicUploadInput = document.getElementById('profile-pic-upload-input');
        
        // Elementos de Display
        this.bannerDisplay = document.getElementById('banner-display');
        this.profilePicDisplay = document.getElementById('profile-pic-display');
        this.profileNameDisplay = document.getElementById('profile-name-display');
        this.profileBioDisplay = document.getElementById('profile-bio-display');
        this.profileClassDisplay = document.getElementById('profile-class-display');
        this.profileFactionDisplay = document.getElementById('profile-faction-display');
        this.followersDisplay = document.getElementById('followers-display');
        this.questsDisplay = document.getElementById('quests-display');
        this.achievementsDisplay = document.getElementById('achievements-display');

        // Inputs do Modal de Edição
        this.profileNameInput = document.getElementById('profile-name-input');
        this.profileBioInput = document.getElementById('profile-bio-input');
        this.profileClassInput = document.getElementById('profile-class-input');
        this.profileFactionInput = document.getElementById('profile-faction-input');
        this.profileAccentColorInput = document.getElementById('profile-accent-color-input');

        // Containers de Conteúdo
        this.postsGrid = document.querySelector('#quest-log .post-grid');
        this.inventoryGrid = document.querySelector('#inventory .inventory-grid');
        this.libraryGrid = document.querySelector('#biblioteca .library-grid');
        this.achievementsGrid = document.querySelector('#conquistas .achievements-grid');
        
        // Abas
        this.tabLinks = document.querySelectorAll('.tabs-nav .tab-link');
        this.tabPanes = document.querySelectorAll('.tabs-content .tab-pane');

        // Modais
        this.settingsModal = document.getElementById('settings-modal');
        this.editProfileModal = document.getElementById('edit-profile-modal');
        
        // Controles de Modais
        this.openSettingsModalBtn = document.getElementById('open-settings-modal-btn');
        this.openEditModalBtn = document.getElementById('open-edit-profile-modal-btn');
    },
    
    // --- Lógica de Eventos ---
    addEventListeners() {
        // ABRIR MODAL DE CONFIGURAÇÕES (LÓGICA ATUALIZADA)
        this.openSettingsModalBtn.addEventListener('click', () => {
            this.openModal(this.settingsModal);
            // Garante que o estado do switch de tema esteja correto ao abrir o modal
            if (window.ThemeManager) {
                window.ThemeManager.updateToggleState();
            }
        });

        this.openEditModalBtn.addEventListener('click', () => this.openEditProfileModal());
        
        // UPLOAD DE IMAGEM
        this.editBannerTrigger.addEventListener('click', () => this.bannerUploadInput.click());
        this.editPicTrigger.addEventListener('click', () => this.profilePicUploadInput.click());
        this.bannerUploadInput.addEventListener('change', e => this.handleImageUpload(e, 'bannerURL', this.bannerDisplay));
        this.profilePicUploadInput.addEventListener('change', e => this.handleImageUpload(e, 'profilePicURL', this.profilePicDisplay));
        
        // ABAS
        this.tabLinks.forEach(link => link.addEventListener('click', () => this.activateTab(link.dataset.tab)));

        // --- Lógica dentro dos Modais ---
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.addEventListener('click', e => {
                if (e.target.classList.contains('modal-overlay') || e.target.closest('.close-modal-btn')) {
                    this.closeModal(modal);
                }
            });
        });
        document.getElementById('edit-profile-from-settings').addEventListener('click', e => {
            e.preventDefault();
            this.closeModal(this.settingsModal);
            this.openEditProfileModal();
        });
        document.getElementById('edit-profile-form').addEventListener('submit', e => this.saveProfileChanges(e));
        document.getElementById('logout-btn').addEventListener('click', () => this.logout());
    },

    // --- Lógica de Dados e Renderização ---
    loadInitialData() {
        // *** LÓGICA DICEBEAR ATUALIZADA ***
        let profilePicUrl = sessionStorage.getItem('profilePicURL');
        const profileName = sessionStorage.getItem('profileName') || 'Seu Nome';

        // Se não houver foto de perfil, gera uma com DiceBear
        if (!profilePicUrl) {
            profilePicUrl = `https://api.dicebear.com/8.x/pixel-art/svg?seed=${encodeURIComponent(profileName)}`;
            sessionStorage.setItem('profilePicURL', profilePicUrl); // Salva para consistência
        }

        this.bannerDisplay.src = sessionStorage.getItem('bannerURL') || this.bannerDisplay.src;
        this.profilePicDisplay.src = profilePicUrl;
        this.profileNameDisplay.textContent = profileName;
        this.profileBioDisplay.textContent = sessionStorage.getItem('profileBio') || 'Sua bio inspiradora vai aqui.';
        this.profileClassDisplay.textContent = sessionStorage.getItem('profileClass') || 'Classe Indefinida';
        this.profileFactionDisplay.textContent = sessionStorage.getItem('profileFaction') || 'Não Alinhado';

        const savedGames = sessionStorage.getItem('ownedGames');
        if (savedGames) this.ownedGames = JSON.parse(savedGames);
    },

    renderAllContent() {
        this.renderStats();
        this.renderQuestLog();
        this.renderInventory();
        this.renderLibrary();
        this.renderAchievements();
    },

    renderStats() {
        this.followersDisplay.textContent = (this.followers > 1000) 
            ? (this.followers / 1000).toFixed(1) + 'K' 
            : this.followers;

        this.questsDisplay.textContent = this.userPosts.length;

        const unlocked = this.achievements.filter(a => a.unlocked).length;
        this.achievementsDisplay.textContent = `${unlocked} / ${this.achievements.length}`;
    },

    renderQuestLog() {
        this.postsGrid.innerHTML = '';
        if (this.userPosts.length === 0) {
            this.postsGrid.innerHTML = `<p class="empty-list-message">Nenhuma missão registrada.</p>`;
            return;
        }
        this.userPosts.forEach(post => {
            this.postsGrid.innerHTML += `
                <div class="post-grid-item" data-post-id="${post.id}">
                    <img src="${post.image}" alt="Post ${post.id}">
                    <div class="post-grid-overlay">
                        <span><i class="fa-solid fa-heart"></i> ${post.likes}</span>
                        <span><i class="fa-solid fa-comment"></i> ${post.comments}</span>
                    </div>
                </div>`;
        });
    },

    renderInventory() {
        this.inventoryGrid.innerHTML = '';
         if (this.inventory.length === 0) {
            this.inventoryGrid.innerHTML = `<p class="empty-list-message">Inventário vazio.</p>`;
            return;
        }
        this.inventory.forEach(item => {
            this.inventoryGrid.innerHTML += `
                <div class="inventory-item-card" title="${item.name}: ${item.desc}">
                    <i class="fa-solid ${item.icon}"></i>
                    <h4>${item.name}</h4>
                    <p>${item.desc}</p>
                </div>
            `;
        });
    },
    
    renderLibrary() {
        this.libraryGrid.innerHTML = '';
        if (this.ownedGames.length === 0) {
            this.libraryGrid.innerHTML = `<p class="empty-list-message">Biblioteca vazia. Adquira jogos na aba 'Jogos'!</p>`;
            return;
        }
        this.ownedGames.forEach(gameId => {
            const gameData = this.storeGames.find(g => g.id === gameId);
            if (gameData) {
                this.libraryGrid.innerHTML += `
                    <div class="library-item-card" title="${gameData.title}">
                        <img src="${gameData.image}" alt="${gameData.title}">
                    </div>
                `;
            }
        });
    },

    renderAchievements() {
        this.achievementsGrid.innerHTML = '';
        this.achievements.forEach(ach => {
            this.achievementsGrid.innerHTML += `
                <div class="achievement-card ${ach.unlocked ? '' : 'locked'}">
                    <div class="achievement-icon"><i class="fa-solid ${ach.icon}"></i></div>
                    <div class="achievement-details">
                        <h4>${ach.title}</h4>
                        <p>${ach.description}</p>
                    </div>
                </div>`;
        });
    },

    activateTab(tabId) {
        this.tabLinks.forEach(link => link.classList.toggle('active', link.dataset.tab === tabId));
        this.tabPanes.forEach(pane => pane.classList.toggle('active', pane.id === tabId));
    },

    // --- Lógica de Ações ---
    handleImageUpload(event, storageKey, element) {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = e => {
            const imageUrl = e.target.result;
            sessionStorage.setItem(storageKey, imageUrl);
            if (element) element.src = imageUrl;
        };
        reader.readAsDataURL(file);
    },

    openModal(modal) {
        modal.classList.remove('hidden');
    },

    closeModal(modal) {
        modal.classList.add('hidden');
    },

    openEditProfileModal() {
        this.profileNameInput.value = sessionStorage.getItem('profileName') || 'Seu Nome';
        this.profileBioInput.value = sessionStorage.getItem('profileBio') || 'Sua bio inspiradora vai aqui.';
        this.profileClassInput.value = sessionStorage.getItem('profileClass') || '';
        this.profileFactionInput.value = sessionStorage.getItem('profileFaction') || '';
        this.profileAccentColorInput.value = sessionStorage.getItem('accentColor') || '#7e7ee3';
        this.openModal(this.editProfileModal);
    },

    saveProfileChanges(event) {
        event.preventDefault();
        const newName = this.profileNameInput.value;
        const newBio = this.profileBioInput.value;
        const newClass = this.profileClassInput.value;
        const newFaction = this.profileFactionInput.value;
        const newColor = this.profileAccentColorInput.value;
        
        this.profileNameDisplay.textContent = newName;
        this.profileBioDisplay.textContent = newBio;
        this.profileClassDisplay.textContent = newClass || 'Classe Indefinida';
        this.profileFactionDisplay.textContent = newFaction || 'Não Alinhado';
        
        sessionStorage.setItem('profileName', newName);
        sessionStorage.setItem('profileBio', newBio);
        sessionStorage.setItem('profileClass', newClass);
        sessionStorage.setItem('profileFaction', newFaction);
        sessionStorage.setItem('accentColor', newColor);
        
        if (window.ProfileCustomizer && typeof window.ProfileCustomizer.applyCustomAccentColor === 'function') {
            window.ProfileCustomizer.applyCustomAccentColor();
        }
        
        this.closeModal(this.editProfileModal);
    },
    
    logout() {
        const theme = localStorage.getItem('theme');
        sessionStorage.clear();
        localStorage.clear(); 
        if(theme) localStorage.setItem('theme', theme); 
        window.location.hash = '#/login'; // Alterado para redirecionar para o login
        window.location.reload(); // Adicionado para recarregar a página e garantir que o estado seja limpo
    }
};
