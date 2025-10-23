// =================================
//  MÓDULO DE LÓGICA DA PÁGINA DE PESQUISA (EXPLORE V2)
// =================================
export const Explore = {
    // --- DADOS SIMULADOS ---
    popularSignals: [
        { 
            type: 'post', 
            user: 'Ana Livia', 
            avatar: 'https://i.pinimg.com/736x/ad/b3/a9/adb3a95eb2128cd200d4f7c2d/c288e4.jpg', 
            image: 'https://images.unsplash.com/photo-1672719232844-3112a44f0c84?q=80&w=800&auto=format&fit=crop', 
            title: 'Finalmente derrotei o último chefe!' 
        },
        { 
            type: 'comunidade', 
            name: 'Retrô Gaming', 
            avatar: 'https://i.pinimg.com/736x/b5/34/4d/b5344d2b278a5b9a41a45add431e6e39.jpg',
            banner: 'https://datalockperu.com/wp-content/uploads/2023/09/Juegos-Retro-en-Kodi-con-un-Addon-Gratuito-Instalacion-de-IAGL.jpg', 
            description: 'Junte-se à nostalgia dos clássicos.' 
        },
        { 
            type: 'post', 
            user: 'Marcos Vale', 
            avatar: 'https://i.pinimg.com/736x/0f/1f/6b/0f1f6bcc56cfa1481fa9c07280cc0717.jpg',
            image: 'https://i.pinimg.com/1200x/92/74/97/9274979699406ca15477a1c299494c13.jpg', 
            title: 'Explorando novos mundos em VR.' 
        },
        { 
            type: 'post', 
            user: 'Carlos Souza', 
            avatar: 'https://i.pinimg.com/736x/32/b5/17/32b51754e1496531c11a027c9a185d24.jpg', 
            image: 'https://gameluster.com/wp-content/uploads/2023/05/vg.jpg', 
            title: 'Meu setup finalmente está completo!' 
        },
    ],
    risingCommunities: [
        { id: 2, name: 'Montanhismo BR', description: 'Compartilhe trilhas, dicas e aventuras nas alturas.', banner: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=800&auto=format&fit=crop', avatar: 'https://i.pinimg.com/736x/1a/07/8c/1a078c1814d2b317ee87f980319988c8.jpg' },
        { id: 3, name: 'Cine-Loucos', description: 'Debates, reviews e teorias sobre a sétima arte.', banner: 'https://images.unsplash.com/photo-1485579149621-3123dd979885?q=80&w=800&auto=format&fit=crop', avatar: 'https://i.pinimg.com/736x/88/c2/5c/88c25cfe14f8e7209ac2941dd7bd440.jpg' },
        { id: 4, name: 'Devs & Café', description: 'Para quem ama código, cafeína e boas conversas.', banner: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=800&auto=format&fit=crop', avatar: 'https://i.pinimg.com/736x/e3/19/36/e31936c2ffddedc3123b0ae87e916cb4.jpg' },
    ],
    newExplorers: [
        { id: 'ana', name: 'Ana Livia', bio: 'Desenvolvedora Web | UI/UX Designer', avatar: 'https://i.pinimg.com/736x/ad/b3/a9/adb3a95eb2128cd200d4f7c2d/c288e4.jpg', isFollowing: false },
        { id: 'marcos', name: 'Marcos Vale', bio: 'Engenheiro de Software | Entusiasta de IA', avatar: 'https://i.pinimg.com/736x/0f/1f/6b/0f1f6bcc56cfa1481fa9c07280cc0717.jpg', isFollowing: true },
        { id: 'carlos', name: 'Carlos Souza', bio: 'Criador de Conteúdo | Gamer', avatar: 'https://i.pinimg.com/736x/32/b5/17/32b51754e1496531c11a027c9a185d24.jpg', isFollowing: false },
        { id: 'juliana', name: 'Juliana Reis', bio: 'Fotógrafa | Viajante', avatar: 'https://i.pinimg.com/736x/24/91/a6/2491a6aad04c52f42af5b2d100f4efc2.jpg', isFollowing: false }
    ],
    allContent: [],
    activeFilter: 'all',

    init() {
        if (!document.querySelector('.content-explore-v2')) return;

        this.cacheDOMElements();
        this.combineAndShuffleData();
        this.loadFollowStatus();
        this.addEventListeners();
        this.renderGrid();
    },
    
    cacheDOMElements() {
        this.searchInput = document.getElementById('explore-search-input');
        this.filterContainer = document.getElementById('explore-filters');
        this.gridContainer = document.getElementById('explore-grid');
    },

    combineAndShuffleData() {
        this.allContent = [
            ...this.popularSignals.map(s => ({...s, dataType: s.type, searchableText: `${s.title} ${s.user || s.name}`})),
            ...this.risingCommunities.map(c => ({...c, dataType: 'comunidade', searchableText: `${c.name} ${c.description}`})),
            ...this.newExplorers.map(u => ({...u, dataType: 'user', searchableText: `${u.name} ${u.bio}`}))
        ];
        // Embaralha para uma experiência de descoberta mais dinâmica
        this.allContent.sort(() => Math.random() - 0.5);
    },

    addEventListeners() {
        if (this.searchInput) {
            this.searchInput.addEventListener('input', () => this.applyFilters());
        }
        if (this.filterContainer) {
            this.filterContainer.addEventListener('click', e => {
                const filterBtn = e.target.closest('.filter-btn');
                if (filterBtn) this.setActiveFilter(filterBtn.dataset.filter);
            });
        }
        if (this.gridContainer) {
            this.gridContainer.addEventListener('click', (e) => {
                const followBtn = e.target.closest('.follow-btn');
                if (followBtn) this.toggleFollow(followBtn.dataset.userId);
            });
        }
    },

    renderGrid() {
        this.gridContainer.innerHTML = '';
        this.allContent.forEach(item => {
            const cardHTML = this.createGridItem(item);
            if(cardHTML) this.gridContainer.insertAdjacentHTML('beforeend', cardHTML);
        });
        this.applyFilters(); // Aplica o filtro inicial
    },

    createGridItem(item) {
        switch(item.dataType) {
            case 'post': return this.createPostCard(item);
            case 'comunidade': return this.createCommunityCard(item);
            case 'user': return this.createUserCard(item);
            default: return '';
        }
    },

    createPostCard(post) {
        return `
            <div class="explore-grid-item" data-type="post" data-searchable-text="${post.searchableText}">
                <img src="${post.image}" alt="${post.title}" class="item-media">
                <div class="item-overlay">
                    <div class="item-footer">
                        <img src="${post.avatar}" alt="${post.user}" class="item-avatar">
                        <span>${post.user}</span>
                    </div>
                </div>
            </div>
        `;
    },

    createCommunityCard(community) {
        return `
            <div class="explore-grid-item" data-type="comunidade" data-searchable-text="${community.searchableText}">
                 <img src="${community.banner}" alt="${community.name}" class="item-media">
                 <div class="item-overlay community-overlay">
                    <img src="${community.avatar}" alt="${community.name}" class="item-avatar-large">
                    <h4>${community.name}</h4>
                    <p>${community.description}</p>
                 </div>
            </div>
        `;
    },
    
    createUserCard(user) {
        const buttonClass = user.isFollowing ? 'btn-secondary joined' : 'btn-primary';
        const buttonText = user.isFollowing ? 'Seguindo' : 'Seguir';
        return `
            <div class="explore-grid-item user-card-item" data-type="user" data-searchable-text="${user.searchableText}">
                <img src="${user.avatar}" alt="Avatar de ${user.name}">
                <h3>${user.name}</h3>
                <p>${user.bio}</p>
                <button class="${buttonClass} follow-btn" data-user-id="${user.id}">${buttonText}</button>
            </div>`;
    },

    setActiveFilter(filter) {
        if (this.activeFilter === filter) return;
        this.activeFilter = filter;
        
        this.filterContainer.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        this.applyFilters();
    },

    applyFilters() {
        const query = this.searchInput.value.toLowerCase();
        
        this.gridContainer.querySelectorAll('.explore-grid-item').forEach(item => {
            const typeMatch = this.activeFilter === 'all' || item.dataset.type === this.activeFilter;
            const textMatch = item.dataset.searchableText.toLowerCase().includes(query);
            item.style.display = typeMatch && textMatch ? 'block' : 'none';
        });
    },

    loadFollowStatus() {
        const savedFollowStatus = JSON.parse(sessionStorage.getItem('followedUsers')) || {};
        this.allContent.forEach(item => {
            if (item.dataType === 'user' && savedFollowStatus[item.id] !== undefined) {
                item.isFollowing = savedFollowStatus[item.id];
            }
        });
    },
    saveFollowStatus() {
        const followStatusToSave = {};
        this.allContent.forEach(item => {
            if(item.dataType === 'user') {
                followStatusToSave[item.id] = item.isFollowing;
            }
        });
        sessionStorage.setItem('followedUsers', JSON.stringify(followStatusToSave));
    },
    toggleFollow(userId) {
        const user = this.allContent.find(item => item.dataType === 'user' && item.id === userId);
        if (user) {
            user.isFollowing = !user.isFollowing;
            this.saveFollowStatus();
            this.renderGrid(); // Re-renderiza para atualizar o botão
        }
    }
};