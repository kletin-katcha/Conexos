// =================================
//  MÓDULO DE LÓGICA DO CHAT v3.0 - "Cyberdeck Interface"
// =================================
export const Chat = {
    activeConversationId: null,
    giphyApiKey: 'cRPAFfmgRPGqxeWQVNowBepFDfqfifPK',
    isRecording: false,
    recordingInterval: null,
    typingIndicatorTimeout: null,

    // ===== DADOS SIMULADOS DE USUÁRIOS =====
    allUsers: [
        { id: 'user1', name: 'Ana Livia', avatar: 'https://i.pinimg.com/736x/ad/b3/a9/adb3a95eb2128cd200d4f7c2d/c288e4.jpg' },
        { id: 'user2', name: 'Carlos Souza', avatar: 'https://i.pinimg.com/736x/32/b5/17/32b51754e1496531c11a027c9a185d24.jpg'},
        { id: 'user3', name: 'Mariana Reis', avatar: 'https://i.pinimg.com/736x/c1/91/c2/c191c270d09a22bdfae381286de3f15d.jpg' },
        { id: 'user4', name: 'Kleitinho', avatar: 'https://placehold.co/100x100/1e1e1e/ffffff?text=K' },
        { id: 'user5', name: 'Marcos Vale', avatar: 'https://i.pinimg.com/736x/0f/1f/6b/0f1f6bcc56cfa1481fa9c07280cc0717.jpg' },
    ],
    conversations: [
        { id: 1, userId: 'user1', name: 'Ana Livia', avatar: 'https://i.pinimg.com/736x/ad/b3/a9/adb3a95eb2128cd200d4f7c2d/c288e4.jpg', status: 'Online', lastMessage: 'Jogando um pouco 🎮', timestamp: '14:05', persona: 'gamer', messages: [{ sender: 'other', type: 'text', content: 'E aí! Bora um game mais tarde?', timestamp: '14:05' }] },
        { id: 2, userId: 'user2', name: 'Carlos Souza', avatar: 'https://i.pinimg.com/736x/32/b5/17/32b51754e1496531c11a027c9a185d24.jpg', status: 'Não Perturbe', lastMessage: 'Focado no código. 👨‍💻', timestamp: '13:30', persona: 'direto', messages: [{ sender: 'other', type: 'text', content: 'Terminando um projeto aqui. Depois a gente se fala.', timestamp: '13:30' }] },
        { id: 3, userId: 'user3', name: 'Mariana Reis', avatar: 'https://i.pinimg.com/736x/c1/91/c2/c191c270d09a22bdfae381286de3f15d.jpg', status: 'Ausente', lastMessage: 'Volto logo! 🌙', timestamp: '12:15', persona: 'amigavel', messages: [{ sender: 'other', type: 'text', content: 'Oieee! Vi sua foto nova, amei! ✨', timestamp: '12:15' }] },
        { id: 4, userId: 'user4', name: 'Kleitinho', avatar: 'https://placehold.co/100x100/1e1e1e/ffffff?text=K', status: 'Offline', lastMessage: 'Dando um rolê por aí.', timestamp: 'Ontem', persona: 'gamer', messages: [{ sender: 'other', type: 'text', content: 'Fechou, mano.', timestamp: 'Ontem' }] }
    ],

    init() {
        if (!document.querySelector('.content-chat-container')) return;
        this.cacheDOMElements();
        this.addEventListeners();
        this.renderConversationsList();
        this.populateEmojiPicker();
    },

    cacheDOMElements() {
        this.conversationsListPanel = document.getElementById('conversations-list-panel');
        this.chatWindowActive = document.getElementById('chat-window-active');
        this.gifPickerModal = document.getElementById('gif-picker-modal');
        this.gifSearchInput = document.getElementById('gif-search-input');
        this.gifPickerGrid = document.getElementById('gif-picker-grid');
        this.emojiPickerModal = document.getElementById('emoji-picker-modal');
        this.emojiPicker = document.getElementById('emoji-picker');
        
        // NOVO: Elementos do Modal de Nova Conversa
        this.newChatBtn = document.getElementById('new-chat-btn');
        this.newChatModal = document.getElementById('new-chat-modal');
        this.newChatSearchInput = document.getElementById('new-chat-search-input');
        this.newChatUserList = document.getElementById('new-chat-user-list');
    },

    addEventListeners() {
        // Selecionar conversa
        this.conversationsListPanel.addEventListener('click', (e) => {
            e.preventDefault();
            const conversationItem = e.target.closest('.conversation-tab-item');
            if (conversationItem) {
                this.setActiveConversation(parseInt(conversationItem.dataset.id));
            }
        });

        // Delegação de eventos para a janela de chat, que é dinâmica
        this.chatWindowActive.addEventListener('click', e => {
            const targetId = e.target.closest('button')?.id;
            switch(targetId) {
                case 'send-message-btn': this.handleSendMessage(); break;
                case 'voice-call-btn': this.startCall('voice'); break;
                case 'video-call-btn': this.startCall('video'); break;
                case 'emoji-btn': this.openEmojiModal(); break;
                case 'gif-btn': this.openGifModal(); break;
            }
        });
        
        this.chatWindowActive.addEventListener('keypress', (e) => {
            if (e.target.id === 'chat-input' && e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleSendMessage();
            }
        });

        // Modais
        [this.gifPickerModal, this.emojiPickerModal, this.newChatModal].forEach(modal => {
             modal.addEventListener('click', e => {
                if (e.target.classList.contains('modal-overlay') || e.target.closest('.close-modal-btn')) {
                    modal.classList.add('hidden');
                }
            });
        });

        // Eventos do Modal de Nova Conversa
        this.newChatBtn.addEventListener('click', () => this.openNewChatModal());
        this.newChatSearchInput.addEventListener('input', (e) => this.renderNewChatUserList(e.target.value));
        this.newChatUserList.addEventListener('click', (e) => {
            const userItem = e.target.closest('.new-chat-user-item');
            if(userItem) this.startNewConversation(userItem.dataset.userId);
        });
        
        this.gifSearchInput.addEventListener('keyup', (e) => { if (e.key === 'Enter') this.searchGifs(e.target.value); });
        this.gifPickerGrid.addEventListener('click', (e) => {
            const gif = e.target.closest('.chat-gif-item');
            if (gif) {
                this.addMessageToConversation('me', 'gif', gif.src);
                this.gifPickerModal.classList.add('hidden');
            }
        });
        this.emojiPicker.addEventListener('click', (e) => this.handleEmojiSelection(e));
    },

    renderConversationsList() {
        this.conversationsListPanel.innerHTML = '';
        this.conversations.forEach(convo => {
            const isActive = convo.id === this.activeConversationId;
            const convoEl = document.createElement('a');
            convoEl.href = '#';
            convoEl.className = `conversation-tab-item ${isActive ? 'active' : ''}`;
            convoEl.dataset.id = convo.id;
            convoEl.innerHTML = `
                <img src="${convo.avatar}" alt="Avatar de ${convo.name}">
                <span>${convo.name}</span>
            `;
            this.conversationsListPanel.appendChild(convoEl);
        });
    },

    setActiveConversation(id) {
        this.activeConversationId = id;
        const convo = this.conversations.find(c => c.id === id);
        if (!convo) return;
        
        this.renderActiveChatWindow(convo);
        this.renderMessages();
        this.renderConversationsList(); // Atualiza a classe 'active'
    },
    
    renderActiveChatWindow(convo) {
        const statusClassMap = { 'Online': 'online', 'Não Perturbe': 'dnd', 'Ausente': 'away', 'Offline': 'offline' };
        
        this.chatWindowActive.innerHTML = `
            <header id="chat-window-header">
                 <div class="user-info">
                    <div class="avatar-wrapper">
                        <img id="chat-window-avatar" src="${convo.avatar}" alt="Avatar" class="chat-window-avatar">
                        <div id="chat-window-status-dot" class="status-dot ${statusClassMap[convo.status] || 'offline'}"></div>
                    </div>
                    <div>
                        <h3 id="chat-window-name">${convo.name}</h3>
                        <span id="chat-window-status">${convo.status}</span>
                    </div>
                 </div>
                 <div class="chat-actions">
                    <button id="voice-call-btn" title="Chamada de Voz"><i class="fa-solid fa-phone"></i></button>
                    <button id="video-call-btn" title="Chamada de Vídeo"><i class="fa-solid fa-video"></i></button>
                 </div>
            </header>
            <div id="message-area" class="message-area"></div>
            <footer id="chat-input-area" class="chat-input-area">
                <div class="input-container">
                    <input type="text" id="chat-input" placeholder="Transmitir mensagem...">
                </div>
                <button id="emoji-btn" class="input-action-btn" title="Emojis"><i class="fa-regular fa-face-smile"></i></button>
                <button id="gif-btn" class="input-action-btn" title="GIF"><i class="fa-solid fa-gift"></i></button>
                <button id="send-message-btn" class="btn-send" title="Enviar"><i class="fa-solid fa-paper-plane"></i></button>
            </footer>
        `;
        // Re-cache dos elementos dinâmicos para uso futuro
        this.messageArea = document.getElementById('message-area');
        this.chatInput = document.getElementById('chat-input');
    },

    renderMessages() {
        const convo = this.conversations.find(c => c.id === this.activeConversationId);
        if (!convo || !this.messageArea) return;
        this.messageArea.innerHTML = '';
        convo.messages.forEach(msg => {
            this.addMessageToDOM(msg, false);
        });
        this.messageArea.scrollTop = this.messageArea.scrollHeight;
    },

    addMessageToDOM(msg, isNew) {
        const convo = this.conversations.find(c => c.id === this.activeConversationId);
        if (!convo || !this.messageArea) return;
        
        const wrapper = document.createElement('div');
        wrapper.className = `message-wrapper ${msg.sender === 'me' ? 'sent' : 'received'}`;

        const myAvatar = sessionStorage.getItem('profilePicURL') || 'https://i.pinimg.com/736x/6a/bc/d9/6abcd9f34ebc8fd7dce5b3edf69a0126.jpg';
        const theirAvatar = convo.avatar;
        const avatarSrc = msg.sender === 'me' ? myAvatar : theirAvatar;

        let contentHTML = '';
        if (msg.type === 'text') contentHTML = `<div class="message-bubble">${msg.content}</div>`;
        else if (msg.type === 'gif' || msg.type === 'image') contentHTML = `<img src="${msg.content}" alt="Mídia" class="message-media">`;
        
        wrapper.innerHTML = `<img src="${avatarSrc}" class="bubble-avatar"><div class="bubble-content">${contentHTML}</div>`;
        this.messageArea.appendChild(wrapper);

        if (isNew) {
            setTimeout(() => { this.messageArea.scrollTop = this.messageArea.scrollHeight; }, 0);
        }
    },

    addMessageToConversation(sender, type, content) {
        if (!this.activeConversationId) return;
        const convo = this.conversations.find(c => c.id === this.activeConversationId);
        const newMessage = { sender, type, content, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
        convo.messages.push(newMessage);
        this.addMessageToDOM(newMessage, true);
    },

    async handleSendMessage() {
        const messageContent = this.chatInput.value.trim();
        if (!messageContent) return;

        this.addMessageToConversation('me', 'text', messageContent);
        this.chatInput.value = '';

        this.showTypingIndicator();

        const convo = this.conversations.find(c => c.id === this.activeConversationId);
        const replyText = await this.getLocalBotReply(messageContent, convo.persona);

        this.hideTypingIndicator();

        if (replyText) {
            this.addMessageToConversation('other', 'text', replyText);
        }
    },

    getLocalBotReply(userMessage, persona) {
        const msg = userMessage.toLowerCase();
        
        const responseBank = {
            gamer: {
                greetings: ["Eaí, mano! Tudo na paz?", "Opa, beleza?", "Fala tu!", "Salve!"],
                defaults: ["Saquei.", "GG.", "Daora.", "Massa!", "Top!", "Entendi.", "Fechou, mano.", "É isso."]
            },
            direto: {
                greetings: ["Olá.", "Oi."],
                defaults: ["Entendido.", "Ok.", "Certo.", "Anotado.", "Recebido.", "Prossiga."]
            },
            amigavel: {
                greetings: ["Oieee! Tudo bem por aí? ✨", "Olá! Que bom falar com você! 😄", "Oii! Como vai?"],
                defaults: ["Que legal! Me conta mais sobre isso. 😉", "Interessante! 🤔", "Adorei! ❤️", "Sério? Que demais! ✨", "Nossa, que bacana! 😄", "Ah, que fofo! 😊"]
            }
        };
        
        const findReply = (message, personaBank) => {
             const greetings = ['oi', 'olá', 'eai', 'eae', 'opa', 'salve'];
             for(const greeting of greetings) {
                 if (message.includes(greeting)) return personaBank.greetings[Math.floor(Math.random() * personaBank.greetings.length)];
             }
            return personaBank.defaults[Math.floor(Math.random() * personaBank.defaults.length)];
        };
    
        const personaResponses = responseBank[persona] || responseBank.direto;
        const reply = findReply(msg, personaResponses);
        
        // Atraso mais realista para simular digitação
        return new Promise(resolve => setTimeout(() => resolve(reply), 1500 + Math.random() * 2000));
    },

    showTypingIndicator() {
        if (!this.messageArea) return;
        this.hideTypingIndicator(); // Remove qualquer um que já exista
        const convo = this.conversations.find(c => c.id === this.activeConversationId);
        if (!convo) return;

        const wrapper = document.createElement('div');
        wrapper.className = 'message-wrapper received typing-indicator';
        wrapper.id = 'typing-indicator';

        wrapper.innerHTML = `
            <img src="${convo.avatar}" class="bubble-avatar">
            <div class="bubble-content">
                <div class="message-bubble">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        `;
        this.messageArea.appendChild(wrapper);
        this.messageArea.scrollTop = this.messageArea.scrollHeight;
    },

    hideTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    },

    startCall(type) {
        if (!this.activeConversationId) return;
        const convo = this.conversations.find(c => c.id === this.activeConversationId);
        if (convo) {
            const callUserId = this.allUsers.find(u => u.name === convo.name)?.id;
            if (callUserId) {
                 window.location.hash = `#/call?user=${callUserId}&type=${type}`;
            } else {
                 window.location.hash = `#/call?user=${this.activeConversationId}&type=${type}`;
            }
        }
    },

    // --- LÓGICA DO NOVO MODAL ---
    openNewChatModal() {
        this.newChatSearchInput.value = '';
        this.renderNewChatUserList();
        this.newChatModal.classList.remove('hidden');
    },

    renderNewChatUserList(filter = '') {
        const existingUserIds = this.conversations.map(c => c.userId);
        const availableUsers = this.allUsers.filter(user => 
            !existingUserIds.includes(user.id) &&
            user.name.toLowerCase().includes(filter.toLowerCase())
        );

        this.newChatUserList.innerHTML = '';
        if (availableUsers.length === 0) {
            this.newChatUserList.innerHTML = `<li class="no-results">Nenhum usuário encontrado.</li>`;
            return;
        }

        availableUsers.forEach(user => {
            const li = document.createElement('li');
            li.className = 'new-chat-user-item';
            li.dataset.userId = user.id;
            li.innerHTML = `
                <img src="${user.avatar}" alt="${user.name}">
                <span>${user.name}</span>
            `;
            this.newChatUserList.appendChild(li);
        });
    },

    startNewConversation(userId) {
        const existingConvo = this.conversations.find(c => c.userId === userId);
        if (existingConvo) {
            this.setActiveConversation(existingConvo.id);
            this.newChatModal.classList.add('hidden');
            return;
        }

        const user = this.allUsers.find(u => u.id === userId);
        if (!user) return;

        const newConvo = {
            id: Date.now(),
            userId: user.id,
            name: user.name,
            avatar: user.avatar,
            status: 'Online',
            persona: 'amigavel', // default
            messages: []
        };
        this.conversations.unshift(newConvo); // Adiciona no início
        this.newChatModal.classList.add('hidden');
        this.setActiveConversation(newConvo.id);
    },

    populateEmojiPicker() {
         if (!this.emojiPicker) return;
        const emojis = ['😀', '😂', '😍', '🤔', '😢', '😡', '👍', '👎', '❤️', '🔥', '🚀', '🎉', '👋', '🙏', '💯', '👏', '👀', '😎', '😜', '😇', '🤯', '🥳', '😭', '😱', '🤢', '🥺', '😏', '🧐', '🤖', '👻', '💀', '👽', '👾', '😴', '🧠', '👑', '💎', '🎮', '🎲', '🍔', '🍕', '🍿', '🍩', '🍺', '🍾', '🎁', '🎈'];
        this.emojiPicker.innerHTML = '';
        emojis.forEach(emoji => {
            const btn = document.createElement('button');
            btn.textContent = emoji;
            this.emojiPicker.appendChild(btn);
        });
    },

    openEmojiModal() { 
        if (this.emojiPickerModal) this.emojiPickerModal.classList.remove('hidden'); 
    },

    handleEmojiSelection(event) {
        const emojiButton = event.target.closest('button');
        if (emojiButton && this.chatInput) {
            this.chatInput.value += emojiButton.textContent;
            this.chatInput.focus();
            if (this.emojiPickerModal) this.emojiPickerModal.classList.add('hidden');
        }
    },

    async openGifModal() {
        if (this.gifPickerModal) {
            this.gifPickerModal.classList.remove('hidden');
            this.gifPickerGrid.innerHTML = '<div class="spinner"></div>';
            await this.searchGifs('trending');
        }
    },

    async searchGifs(query) {
        this.gifPickerGrid.innerHTML = '<div class="spinner"></div>';
        const url = query === 'trending' ? `https://api.giphy.com/v1/gifs/trending?api_key=${this.giphyApiKey}&limit=20` : `https://api.giphy.com/v1/gifs/search?api_key=${this.giphyApiKey}&q=${query}&limit=20`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            this.gifPickerGrid.innerHTML = data.data.map(gif => `<img src="${gif.images.fixed_height_small.url}" alt="${gif.title}" class="chat-gif-item">`).join('');
        } catch (error) {
            this.gifPickerGrid.innerHTML = '<p>Não foi possível carregar.</p>';
        }
    },
};