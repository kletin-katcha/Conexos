// =================================
//  MÓDULO DE LÓGICA DO HUB DE COMUNIDADE (REMAKE "TERMINAL")
// =================================
export const Serve = {
    communityData: null,
    currentUser: {
        name: 'Você',
        avatar: 'https://i.pinimg.com/736x/6a/bc/d9/6abcd9f34ebc8fd7dce5b3edf69a0126.jpg'
    },
    simulatedMembers: [],
    giphyApiKey: 'cRPAFfmgRPGqxeWQVNowBepFDfqfifPK',
    isVerified: false,
    chatInterval: null,
    activeChannel: 'verifique-se',
    typingIndicatorTimeout: null,

    init() {
        if (!document.querySelector('.terminal-container')) return;

        this.cacheDOMElements();
        this.loadCommunityData();
        this.addEventListeners();
        this.checkVerificationState();
        this.startGalaxyAnimation();
        this.populateEmojiPicker(); // Adicionado
    },

    cacheDOMElements() {
        // Layout Principal
        this.hubCommunityAvatar = document.getElementById('hub-community-avatar');
        this.hubCommunityName = document.getElementById('hub-community-name');
        this.hubBackBtn = document.getElementById('hub-back-btn');
        this.toggleNavBtn = document.getElementById('toggle-nav-btn');
        
        // Navegação
        this.navigationDeck = document.getElementById('navigation-deck');
        this.channelNavigator = document.querySelector('.channel-navigator');
        
        // Painel do Usuário
        this.userPanel = document.getElementById('user-panel');
        this.currentUserAvatar = document.getElementById('current-user-avatar');
        this.currentUserName = document.getElementById('current-user-name');
        
        // Terminal Central
        this.terminalContentArea = document.getElementById('terminal-content-area');
        this.terminalFooter = document.getElementById('terminal-footer');

        // Painel de Membros
        this.membersPanel = document.getElementById('members-panel');

        // Modals e Inputs
        this.gifPickerModal = document.getElementById('gif-picker-modal');
        this.gifSearchInput = document.getElementById('gif-search-input');
        this.gifPickerGrid = document.getElementById('gif-picker-grid');
        this.emojiPickerModal = document.getElementById('emoji-picker-modal');
        this.emojiPickerBody = document.getElementById('emoji-picker-body');
        this.imageUploadInput = document.getElementById('image-upload-input');
    },

    addEventListeners() {
        this.hubBackBtn.addEventListener('click', () => this.leaveCommunity());
        this.toggleNavBtn.addEventListener('click', () => this.toggleNavDeck());

        this.channelNavigator.addEventListener('click', e => {
            const channelLink = e.target.closest('a');
            if (channelLink) {
                e.preventDefault();
                this.handleChannelClick(channelLink);
            }
        });
        
        this.terminalFooter.addEventListener('click', e => this.handleFooterEvents(e));
        this.terminalFooter.addEventListener('keypress', e => this.handleFooterKeypress(e));
        
        this.terminalContentArea.addEventListener('click', e => {
            if (e.target.id === 'verify-button') this.verifyUser();
        });

        // Eventos dos Modais
        [this.gifPickerModal, this.emojiPickerModal].forEach(modal => {
            if(modal) modal.addEventListener('click', e => {
                if (e.target.classList.contains('modal-overlay') || e.target.closest('.close-modal-btn')) {
                    modal.classList.add('hidden');
                }
            });
        });

        if(this.gifSearchInput) this.gifSearchInput.addEventListener('keyup', (e) => { if (e.key === 'Enter') this.searchGifs(e.target.value); });
        if(this.gifPickerGrid) this.gifPickerGrid.addEventListener('click', (e) => {
            const gif = e.target.closest('.serve-gif-item');
            if (gif) {
                this.addMessageToConversation('me', 'gif', gif.src);
                this.gifPickerModal.classList.add('hidden');
            }
        });

        if(this.emojiPickerBody) this.emojiPickerBody.addEventListener('click', (e) => {
             const button = e.target.closest('button');
            if(button && this.chatInput) {
                this.chatInput.value += button.textContent;
                this.emojiPickerModal.classList.add('hidden');
            }
        });

        if(this.imageUploadInput) this.imageUploadInput.addEventListener('change', e => this.handleFileUpload(e.target.files[0]));
    },

    toggleNavDeck() {
        this.navigationDeck.classList.toggle('visible');
        this.userPanel.classList.toggle('visible');
    },

    handleFooterEvents(e) {
        if (e.target.closest('#send-message-btn')) this.sendUserMessage();
        if (e.target.closest('#attachment-btn')) this.imageUploadInput.click();
        if (e.target.closest('#gif-btn')) this.openGifModal();
        if (e.target.closest('#emoji-btn')) this.openEmojiModal();
    },

    handleFooterKeypress(e) {
        if (e.key === 'Enter' && e.target.id === 'hub-chat-input' && !e.shiftKey) {
            e.preventDefault();
            this.sendUserMessage();
        }
    },
    
    loadCommunityData() {
        const communityDataString = sessionStorage.getItem('activeCommunity');
        if (!communityDataString) {
            this.hubCommunityName.textContent = "Erro";
            return;
        }
        this.communityData = JSON.parse(communityDataString);
        
        const savedAvatar = sessionStorage.getItem('profilePicURL');
        if (savedAvatar) this.currentUser.avatar = savedAvatar;
        const savedName = sessionStorage.getItem('profileName');
        if(savedName) this.currentUser.name = savedName;

        document.title = `${this.communityData.name} - Conexo`;
        this.hubCommunityName.textContent = this.communityData.name;
        this.hubCommunityAvatar.src = this.communityData.avatar;
        this.currentUserAvatar.src = this.currentUser.avatar;
        this.currentUserName.textContent = this.currentUser.name;

        this.generateSimulatedMembers();
        this.renderMemberList();
    },

    checkVerificationState() {
        const verificationKey = `verified_${this.communityData?.id}`;
        this.isVerified = sessionStorage.getItem(verificationKey) === 'true';
        this.renderChannels();

        if (this.isVerified) {
            this.switchToChannel('geral');
        } else {
            this.switchToChannel('verifique-se');
        }
    },

    verifyUser() {
        const verificationKey = `verified_${this.communityData.id}`;
        sessionStorage.setItem(verificationKey, 'true');
        this.isVerified = true;
        this.renderChannels();
        this.switchToChannel('regras');
    },

    generateSimulatedMembers() {
        this.simulatedMembers = [
            { name: 'Ana Livia', avatar: 'https://i.pinimg.com/736x/ad/b3/a9/adb3a95eb2128cd200d4f7c2d/c288e4.jpg', online: true },
            { name: 'Carlos Souza', avatar: 'https://i.pinimg.com/736x/32/b5/17/32b51754e1496531c11a027c9a185d24.jpg', online: true },
            { name: 'Astro', avatar: 'https://i.pinimg.com/736x/e3/19/36/e31936c2ffddedc3123b0ae87e916cb4.jpg', online: true },
            { name: 'Juliana', avatar: 'https://i.pinimg.com/736x/c1/91/c2/c191c270d09a22bdfae381286de3f15d.jpg', online: false },
        ];
    },

    handleChannelClick(channelLink) {
        if (channelLink.closest('li').classList.contains('locked')) return;
        this.switchToChannel(channelLink.dataset.channelName, channelLink.dataset.channelType);
        if (window.innerWidth <= 768) {
            this.toggleNavDeck();
        }
    },

    switchToChannel(channelName, channelType = 'text') {
        this.activeChannel = channelName;
        this.updateActiveChannelLink();

        clearInterval(this.chatInterval);

        const chatChannels = ['geral', 'jogos', 'arte'];

        if (chatChannels.includes(channelName)) {
            this.renderTextChatContent();
            this.loadMessages();
            if (channelName === 'geral') this.startSimulatedChat();
        } else {
             this.terminalFooter.innerHTML = '';
             switch (channelName) {
                case 'verifique-se': this.renderVerificationContent(); break;
                case 'regras': this.renderRulesContent(); break;
                case 'painel-de-controle': this.renderControlPanel(); break;
            }
        }
    },
    
    updateActiveChannelLink() {
        document.querySelectorAll('.channel-list a').forEach(a => a.classList.remove('active'));
        const activeLink = document.querySelector(`[data-channel-name="${this.activeChannel}"]`);
        if (activeLink) activeLink.classList.add('active');
    },
    
    renderChannels() {
        const channels = {
            'Comece Aqui': ['verifique-se', 'regras'],
            'Canais de Texto': ['geral', 'jogos', 'arte'],
            'Admin': ['painel-de-controle']
        };
        let html = '';
        for (const category in channels) {
            html += `<div class="channel-group"><div class="channel-category">${category}</div><ul class="channel-list">`;
            channels[category].forEach(name => {
                const isLocked = !this.isVerified && !['verifique-se', 'regras'].includes(name);
                const icon = isLocked ? 'fa-lock' : { 'verifique-se': 'fa-shield-check', 'regras': 'fa-scroll', 'geral': 'fa-hashtag', 'jogos': 'fa-gamepad', 'arte': 'fa-palette', 'painel-de-controle': 'fa-sliders' }[name] || 'fa-hashtag';
                html += `<li class="${isLocked ? 'locked' : ''}"><a href="#" data-channel-name="${name}" data-channel-type="text"><i class="fa-solid ${icon}"></i> <span>${name.replace(/-/g, ' ')}</span></a></li>`;
            });
            html += `</ul></div>`;
        }
        this.channelNavigator.innerHTML = html;
    },

    renderMemberList() {
        const online = this.simulatedMembers.filter(m => m.online);
        const offline = this.simulatedMembers.filter(m => !m.online);
        
        const createMemberHTML = (member) => 
            `<div class="member-item ${member.online ? 'online' : 'offline'}"><img src="${member.avatar}" alt="${member.name}"><span>${member.name}</span></div>`;
        
        let html = `<div class="member-category">Online - ${online.length + 1}</div>` + createMemberHTML({ ...this.currentUser, online: true }) + online.map(createMemberHTML).join('');
        if (offline.length > 0) {
            html += `<div class="member-category">Offline - ${offline.length}</div>` + offline.map(createMemberHTML).join('');
        }
        this.membersPanel.innerHTML = html;
    },
    
    renderVerificationContent() {
        this.terminalContentArea.innerHTML = `
            <div class="system-message-container">
                <h3><i class="fa-solid fa-shield-check"></i> Verificação Necessária</h3>
                <p>Para acessar os canais e conversar, você precisa concordar com as regras da comunidade.</p>
                <button id="verify-button" class="btn-primary">Concluir Verificação</button>
            </div>`;
    },

    renderRulesContent() {
        this.terminalContentArea.innerHTML = `
            <div class="system-message-container">
                <h3><i class="fa-solid fa-scroll"></i> Regras da Comunidade</h3>
                <p style="text-align: left; max-width: 90%; margin: 1.5rem auto;">
                    1. Respeite todos os membros.<br>
                    2. Não compartilhe conteúdo NSFW.<br>
                    3. Sem spam ou auto-promoção excessiva.<br>
                    4. Mantenha as discussões nos canais corretos.
                </p>
            </div>`;
    },
    
    renderControlPanel() {
        this.terminalContentArea.innerHTML = `<div class="system-message-container"><h3>Painel de Controle</h3><p>Em desenvolvimento.</p></div>`;
    },

    renderTextChatContent() {
        this.terminalContentArea.innerHTML = '';
        this.chatMessages = this.terminalContentArea;

        this.terminalFooter.innerHTML = `
            <button id="attachment-btn" class="header-action-btn" title="Anexar"><i class="fa-solid fa-paperclip"></i></button>
            <div class="chat-input-wrapper">
                <input type="text" id="hub-chat-input" placeholder="Conversar em #${this.activeChannel}">
                <button id="emoji-btn" class="header-action-btn" title="Emojis"><i class="fa-regular fa-face-smile"></i></button>
                <button id="gif-btn" class="header-action-btn" title="GIF"><i class="fa-solid fa-gift"></i></button>
            </div>
            <button id="send-message-btn" class="header-action-btn" title="Enviar"><i class="fa-solid fa-paper-plane"></i></button>
        `;
        this.chatInput = document.getElementById('hub-chat-input');
    },

    addChatMessage(msgData, isUserMessage = false) {
        if (!this.chatMessages) return;
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message-bubble ${isUserMessage ? 'sent' : 'received'}`;
        
        let contentHTML = (msgData.type === 'gif' || msgData.type === 'image')
            ? `<img src="${msgData.message}" alt="Mídia enviada" class="bubble-media">`
            : `<p>${msgData.message}</p>`;

        messageDiv.innerHTML = `
            <img src="${msgData.avatar}" alt="${msgData.sender}" class="bubble-avatar">
            <div class="bubble-content">
                <div class="bubble-header">
                    <span class="bubble-username">${msgData.sender}</span>
                    <span class="bubble-timestamp">${msgData.timestamp}</span>
                </div>
                ${contentHTML}
            </div>`;
        this.chatMessages.appendChild(messageDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    },

    addMessageToConversation(sender, type, content) {
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const isUser = sender === 'me';
        const senderData = isUser ? this.currentUser : this.simulatedMembers.find(m => m.name === sender);
        if (!senderData) return;

        const messageData = { sender: senderData.name, message: content, avatar: senderData.avatar, timestamp, type };
        this.addChatMessage(messageData, isUser);
        this.saveMessage(messageData);

        if (isUser) this.startSimulatedChat(true);
    },
    
    sendUserMessage() {
        const message = this.chatInput.value.trim();
        if (message) {
            this.addMessageToConversation('me', 'text', message);
            this.chatInput.value = '';
        }
    },

    handleFileUpload(file) {
        if (!file || !file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            this.addMessageToConversation('me', 'image', e.target.result);
        };
        reader.readAsDataURL(file);
    },

    startSimulatedChat(immediateReply = false) {
        if (this.activeChannel !== 'geral') return;
        clearInterval(this.chatInterval);
        const sendReply = () => { if (this.isVerified && this.activeChannel === 'geral') this.simulateReply(); };
        
        const delay = immediateReply ? (2000 + Math.random() * 2000) : (8000 + Math.random() * 5000);
        setTimeout(sendReply, delay);

        this.chatInterval = setInterval(sendReply, 15000 + Math.random() * 10000);
    },

    simulateReply() {
        const onlineBots = this.simulatedMembers.filter(m => m.online && m.name !== 'Astro');
        if (onlineBots.length === 0) return;
        const randomBot = onlineBots[Math.floor(Math.random() * onlineBots.length)];
        
        const replies = ["Que legal!", "Entendi, muito bom!", "Faz todo sentido.", "Concordo!"];
        const randomReply = replies[Math.floor(Math.random() * replies.length)];
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const messageData = { sender: randomBot.name, message: randomReply, avatar: randomBot.avatar, timestamp, type: 'text' };

        this.addChatMessage(messageData);
        this.saveMessage(messageData);
    },

    getStorageKey() { return `community_chat_${this.communityData.id}_${this.activeChannel}`; },
    
    saveMessage(messageData) {
        const key = this.getStorageKey();
        let messages = JSON.parse(sessionStorage.getItem(key) || '[]');
        messages.push(messageData);
        sessionStorage.setItem(key, JSON.stringify(messages));
    },

    loadMessages() {
        const key = this.getStorageKey();
        const messages = JSON.parse(sessionStorage.getItem(key) || '[]');
        this.terminalContentArea.innerHTML = '';
        
        if (messages.length === 0) {
            const welcomeMsg = { 
                sender: 'Astro', message: `Bem-vindo(a) ao canal #${this.activeChannel}!`, 
                avatar: 'https://i.pinimg.com/736x/e3/19/36/e31936c2ffddedc3123b0ae87e916cb4.jpg', 
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), type: 'text'
            };
            this.addChatMessage(welcomeMsg);
            this.saveMessage(welcomeMsg);
        } else {
            messages.forEach(msg => this.addChatMessage(msg, msg.sender === this.currentUser.name));
        }
    },

    async openGifModal() {
        if(!this.gifPickerModal) return;
        this.gifPickerModal.classList.remove('hidden');
        this.gifPickerGrid.innerHTML = '<div class="spinner"></div>';
        await this.searchGifs('trending');
    },

    async searchGifs(query) {
        const url = query === 'trending'
            ? `https://api.giphy.com/v1/gifs/trending?api_key=${this.giphyApiKey}&limit=21`
            : `https://api.giphy.com/v1/gifs/search?api_key=${this.giphyApiKey}&q=${query}&limit=21`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            this.gifPickerGrid.innerHTML = data.data.map(gif => 
                `<img src="${gif.images.fixed_height_small.url}" alt="${gif.title}" class="serve-gif-item">`
            ).join('');
        } catch (error) {
            this.gifPickerGrid.innerHTML = '<p>Não foi possível carregar os GIFs.</p>';
        }
    },
    
    openEmojiModal() {
        if(this.emojiPickerModal) this.emojiPickerModal.classList.remove('hidden');
    },
    
    populateEmojiPicker() {
        if (!this.emojiPickerBody) return;
        const emojis = ['😀', '😂', '😍', '🤔', '😢', '😡', '👍', '👎', '❤️', '🔥', '🚀', '🎉', '👋', '🙏', '💯', '👏', '👀', '😎', '😜', '😇', '🤯', '🥳', '😭', '😱', '🤢', '🥺', '😏', '🧐', '🤖', '👻', '💀', '👽', '👾', '😴', '🧠', '👑', '💎', '🎮', '🎲', '🍔', '🍕', '🍿', '🍩', '🍺', '🍾', '🎁', '🎈'];
        this.emojiPickerBody.innerHTML = '';
        emojis.forEach(emoji => {
            const btn = document.createElement('button');
            btn.textContent = emoji;
            this.emojiPickerBody.appendChild(btn);
        });
    },

    leaveCommunity() {
        clearInterval(this.chatInterval);
        window.location.hash = '#/comunidade';
    },

    startGalaxyAnimation() {
        const canvas = document.getElementById('galaxy-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let stars = [];
        const setCanvasSize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        const createStarfield = () => {
            stars = [];
            const starCount = Math.floor((canvas.width * canvas.height) / 4000);
            for (let i = 0; i < starCount; i++) {
                stars.push({
                    x: Math.random() * canvas.width, y: Math.random() * canvas.height,
                    radius: Math.random() * 1.5 + 0.5, vx: (Math.random() - 0.5) * 0.1,
                    vy: (Math.random() - 0.5) * 0.1, opacity: Math.random() * 0.5 + 0.3
                });
            }
        };
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            stars.forEach(star => {
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(224, 226, 231, ${star.opacity})`;
                ctx.fill();
                star.x += star.vx; star.y += star.vy;
                if (star.x < 0 || star.x > canvas.width) star.vx = -star.vx;
                if (star.y < 0 || star.y > canvas.height) star.vy = -star.vy;
            });
            requestAnimationFrame(animate);
        };
        window.addEventListener('resize', () => { setCanvasSize(); createStarfield(); });
        setCanvasSize(); createStarfield(); animate();
    }
};