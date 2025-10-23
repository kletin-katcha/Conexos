// =================================
//  MÓDULO DE LÓGICA DA PÁGINA DE COMUNIDADES (V2 - EVOLUTIVAS)
// =================================
export const Comunidade = {
    allCommunities: [],
    tempBannerFile: null,
    tempAvatarFile: null,

    init() {
        if (!document.querySelector('.content-communities')) return;

        this.cacheDOMElements();
        this.loadData();
        this.addEventListeners();
        this.renderAll();
    },

    cacheDOMElements() {
        this.yourCommunitiesGrid = document.getElementById('your-communities-grid');
        this.discoverCommunitiesGrid = document.getElementById('discover-communities-grid');
        this.createCommunityBtn = document.getElementById('create-community-btn');
        this.createCommunityModal = document.getElementById('create-community-modal');
        this.createCommunityForm = document.getElementById('create-community-form');
        this.communityNameInput = document.getElementById('community-name-input');
        this.communityDescInput = document.getElementById('community-desc-input');
        
        // Novos elementos para upload de imagem
        this.communityBannerInput = document.getElementById('community-banner-input');
        this.communityAvatarInput = document.getElementById('community-avatar-input');
        this.bannerPreview = document.getElementById('banner-preview');
        this.avatarPreview = document.getElementById('avatar-preview');
        this.bannerPlaceholder = document.getElementById('banner-placeholder');
        this.avatarPlaceholder = document.getElementById('avatar-placeholder');
        
        this.mainContent = document.querySelector('.communities-main-content');
    },

    addEventListeners() {
        this.createCommunityBtn.addEventListener('click', () => this.openModal(this.createCommunityModal));
        
        this.createCommunityModal.addEventListener('click', e => {
            if (e.target.classList.contains('modal-overlay') || e.target.closest('.close-modal-btn')) {
                this.closeModal(this.createCommunityModal);
            }
        });

        this.createCommunityForm.addEventListener('submit', e => this.handleCreateCommunity(e));
        
        this.mainContent.addEventListener('click', e => {
            const communityBtn = e.target.closest('.join-leave-btn');
            if(communityBtn) {
                this.handleEnterCommunity(communityBtn.dataset.communityId);
            }
        });

        this.communityBannerInput.addEventListener('change', e => this.previewImage(e.target, this.bannerPreview, this.bannerPlaceholder, 'banner'));
        this.communityAvatarInput.addEventListener('change', e => this.previewImage(e.target, this.avatarPreview, this.avatarPlaceholder, 'avatar'));
    },

    loadData() {
        const savedCommunities = sessionStorage.getItem('conexo-communities');
        if (savedCommunities) {
            this.allCommunities = JSON.parse(savedCommunities);
        } else {
            // Dados padrão com Nível e XP
            this.allCommunities = [
                { id: 1, name: 'Retrô Gaming', description: 'A nostalgia dos jogos que marcaram gerações.', banner: 'https://datalockperu.com/wp-content/uploads/2023/09/Juegos-Retro-en-Kodi-con-un-Addon-Gratuito-Instalacion-de-IAGL.jpg', avatar: 'https://i.pinimg.com/736x/b5/34/4d/b5344d2b278a5b9a41a45add431e6e39.jpg', isJoined: true, level: 5, xp: 450, xpToNextLevel: 1000 },
                { id: 2, name: 'Montanhismo BR', description: 'Compartilhe trilhas, dicas e aventuras nas alturas.', banner: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=800&auto=format&fit=crop', avatar: 'https://i.pinimg.com/736x/1a/07/8c/1a078c1814d2b317ee87f980319988c8.jpg', isJoined: false, level: 2, xp: 120, xpToNextLevel: 500 },
                { id: 3, name: 'Cine-Loucos', description: 'Debates, reviews e teorias sobre a sétima arte.', banner: 'https://images.unsplash.com/photo-1485579149621-3123dd979885?q=80&w=800&auto=format&fit=crop', avatar: 'https://i.pinimg.com/736x/88/c2/5c/88c25cfe14f8e7209ac2941dd7bd440.jpg', isJoined: false, level: 10, xp: 9500, xpToNextLevel: 10000 },
                { id: 4, name: 'Devs & Café', description: 'Para quem ama código, cafeína e boas conversas.', banner: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=800&auto=format&fit=crop', avatar: 'https://i.pinimg.com/736x/e3/19/36/e31936c2ffddedc3123b0ae87e916cb4.jpg', isJoined: false, level: 8, xp: 6200, xpToNextLevel: 8000 }
            ];
        }
    },

    saveData() {
        sessionStorage.setItem('conexo-communities', JSON.stringify(this.allCommunities));
    },

    renderAll() {
        const yourCommunities = this.allCommunities.filter(c => c.isJoined);
        const discoverCommunities = this.allCommunities.filter(c => !c.isJoined);

        this.renderGrid(this.yourCommunitiesGrid, yourCommunities, true);
        this.renderGrid(this.discoverCommunitiesGrid, discoverCommunities, false);
    },

    renderGrid(gridElement, communities, isJoinedList) {
        gridElement.innerHTML = '';
        if (communities.length === 0) {
            gridElement.innerHTML = `<p class="empty-list-message">${isJoinedList ? 'Você ainda não entrou em nenhuma comunidade.' : 'Nenhuma nova comunidade para descobrir.'}</p>`;
            return;
        }
        communities.forEach(community => {
            const cardHTML = this.createCommunityCard(community);
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = cardHTML.trim();
            const cardElement = tempDiv.firstChild;
            
            gridElement.appendChild(cardElement);

            // Adiciona listeners para o efeito 3D TILT
            cardElement.addEventListener('mousemove', e => this.apply3DTilt(e, cardElement));
            cardElement.addEventListener('mouseleave', () => this.reset3DTilt(cardElement));
        });
    },
    
    apply3DTilt(e, element) {
        const rect = element.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = element.offsetWidth / 2;
        const centerY = element.offsetHeight / 2;
        const deltaX = x - centerX;
        const deltaY = y - centerY;
        const maxRotation = 6; // Rotação mais sutil para cards maiores

        const rotateX = (deltaY / centerY) * -maxRotation;
        const rotateY = (deltaX / centerX) * maxRotation;
        
        element.style.transition = 'transform 0.05s linear';
        element.style.transform = `perspective(1500px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.04, 1.04, 1.04)`;
    },

    reset3DTilt(element) {
        element.style.transition = 'transform 0.4s cubic-bezier(0.23, 1, 0.32, 1)';
        element.style.transform = `perspective(1500px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    },

    createCommunityCard(community) {
        const isJoined = community.isJoined;
        const buttonText = isJoined ? 'Entrar' : 'Juntar-se';
        const xpPercentage = (community.xp / community.xpToNextLevel) * 100;

        return `
            <div class="community-card" data-searchable-text="${community.name} ${community.description}">
                <div class="card-banner" style="background-image: url('${community.banner}');"></div>
                <img src="${community.avatar}" alt="Avatar da Comunidade" class="card-avatar">
                <div class="card-info">
                    <h3>${community.name}</h3>
                    <p>${community.description}</p>
                    <button class="btn-primary join-leave-btn" data-community-id="${community.id}">${buttonText}</button>
                </div>
                <div class="card-level-info">
                    <span class="level-badge">Nível ${community.level}</span>
                    <div class="xp-bar-bg" title="${community.xp} / ${community.xpToNextLevel} XP">
                        <div class="xp-bar-progress" style="width: ${xpPercentage}%;"></div>
                    </div>
                </div>
            </div>
        `;
    },
    
    handleEnterCommunity(id) {
        const communityId = parseInt(id);
        const community = this.allCommunities.find(c => c.id === communityId);
        if (community) {
            if (!community.isJoined) {
                community.isJoined = true;
                this.saveData();
                this.renderAll();
            }
            sessionStorage.setItem('activeCommunity', JSON.stringify(community));
            window.location.hash = '#/serve';
        }
    },

    handleCreateCommunity(event) {
        event.preventDefault();
        const name = this.communityNameInput.value.trim();
        const description = this.communityDescInput.value.trim();

        if (!name || !description) {
            alert("Nome e descrição são obrigatórios!");
            return;
        }

        // *** NOVA LÓGICA DICEBEAR ***
        const bannerUrl = this.tempBannerFile ? URL.createObjectURL(this.tempBannerFile) : `https://placehold.co/600x240/1e1e1e/3a3b3c?text=${name.charAt(0)}`;
        const avatarUrl = this.tempAvatarFile ? URL.createObjectURL(this.tempAvatarFile) : `https://api.dicebear.com/8.x/pixel-art/svg?seed=${encodeURIComponent(name)}`;

        const newCommunity = {
            id: Date.now(),
            name,
            description,
            banner: bannerUrl,
            avatar: avatarUrl,
            isJoined: true,
            level: 1,
            xp: 0,
            xpToNextLevel: 250 // XP inicial para o próximo nível
        };

        this.allCommunities.push(newCommunity);
        this.saveData();
        this.renderAll();
        this.closeModal(this.createCommunityModal);
    },

    previewImage(input, previewElement, placeholderElement, type) {
        const file = input.files[0];
        if (file) {
            if (type === 'banner') this.tempBannerFile = file;
            if (type === 'avatar') this.tempAvatarFile = file;

            const reader = new FileReader();
            reader.onload = (e) => {
                previewElement.src = e.target.result;
                previewElement.classList.remove('hidden');
                placeholderElement.classList.add('hidden');
            };
            reader.readAsDataURL(file);
        }
    },

    openModal(modal) {
        this.createCommunityForm.reset();
        this.avatarPreview.src = '#';
        this.bannerPreview.src = '#';
        this.avatarPreview.classList.add('hidden');
        this.bannerPreview.classList.add('hidden');
        this.avatarPlaceholder.classList.remove('hidden');
        this.bannerPlaceholder.classList.remove('hidden');
        this.tempAvatarFile = null;
        this.tempBannerFile = null;
        modal.classList.remove('hidden');
    },

    closeModal(modal) {
        modal.classList.add('hidden');
    }
};