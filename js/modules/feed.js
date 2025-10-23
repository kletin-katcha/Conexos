// =================================
//  MÓDULO DE FUNCIONALIDADE DO FEED V4.0
// =================================
import { getAccessToken } from './spotify-config.js';

export const FeedV2 = {
    currentUser: {
        name: 'Você',
        avatar: 'https://i.pinimg.com/736x/6a/bc/d9/6abcd9f34ebc8fd7dce5b3edf69a0126.jpg'
    },
    posts: [],
    stories: [],
    suggestions: [],
    voiceChannels: [],
    stagedPostFile: null,
    stagedStoryFile: null,
    currentStoryUserIndex: 0,
    storyTimer: null,
    activePostIdForComment: null,
    giphyApiKey: 'cRPAFfmgRPGqxeWQVNowBepFDfqfifPK', // API Key from chat.js

    init() {
        if (!document.querySelector('.content-feed-v2')) return;
        this.cacheDOMElements();
        this.loadData();
        this.addEventListeners();
        this.populateEmojiPicker();
        this.renderAll();

        // Listener para atualizar o feed quando uma música for adicionada
        window.addEventListener('musicAddedToPlayer', () => this.renderPosts());
    },

    cacheDOMElements() {
        this.feedContainer = document.getElementById('feed-container-v2');
        this.storiesSection = document.querySelector('.stories-section-v2');
        this.suggestionsList = document.querySelector('.suggestions-list');
        this.voiceChannelsList = document.querySelector('.voice-channels-list');
        this.plogsGrid = document.querySelector('.plogs-grid');
        this.toastMessage = document.getElementById('toast-message');
        this.plogViewerModal = document.getElementById('plog-viewer-modal');
        this.plogModalTitle = document.getElementById('plog-modal-title');
        this.plogModalContent = document.getElementById('plog-modal-content');
        
        this.openCreatePostModalBtn = document.getElementById('open-create-post-modal-btn');
        this.createPostModal = document.getElementById('create-post-modal');
        this.createPostForm = document.getElementById('create-post-form');
        this.postTextInput = document.getElementById('post-text-input');
        this.postMediaBtn = document.getElementById('post-media-btn');
        this.postMediaInput = document.getElementById('post-media-input');
        this.postMediaPreviewContainer = document.getElementById('post-media-preview-container');
        this.submitPostBtn = this.createPostForm.querySelector('button[type="submit"]');

        this.addStoryModal = document.getElementById('add-story-modal-v2');
        this.addStoryForm = document.getElementById('add-story-form-v2');
        this.storyImageInput = document.getElementById('story-image-input');
        this.storyImageUploadArea = this.addStoryForm.querySelector('.remake-upload-area');
        this.storyImagePreviewContainer = document.getElementById('story-image-preview-container-v2');
        this.submitStoryBtn = this.addStoryForm.querySelector('button[type="submit"]');

        this.storyViewerModal = document.getElementById('story-viewer-modal-v2');
        this.storyProgressBarsContainer = document.getElementById('story-progress-bars-container-v2');
        this.storyViewerAvatar = document.getElementById('story-viewer-avatar-v2');
        this.storyViewerUsername = document.getElementById('story-viewer-username-v2');
        this.storyViewerTimestamp = document.getElementById('story-viewer-timestamp-v2');
        this.storyViewerMedia = document.getElementById('story-viewer-media-v2');
        this.storyPrevBtn = document.getElementById('story-prev-btn-v2');
        this.storyNextBtn = document.getElementById('story-next-btn-v2');

        this.commentsModal = document.getElementById('comments-modal');
        this.commentsModalTitle = document.getElementById('comments-modal-title');
        this.commentsList = document.getElementById('comments-list');
        this.commentForm = document.getElementById('comment-form');
        this.commentInput = document.getElementById('comment-input');

        this.commentEmojiBtn = document.getElementById('comment-emoji-btn');
        this.commentGifBtn = document.getElementById('comment-gif-btn');
        this.gifPickerModalFeed = document.getElementById('gif-picker-modal-feed');
        this.gifSearchInputFeed = document.getElementById('gif-search-input-feed');
        this.gifPickerGridFeed = document.getElementById('gif-picker-grid-feed');
        this.emojiPickerModalFeed = document.getElementById('emoji-picker-modal-feed');
        this.emojiPickerFeed = document.getElementById('emoji-picker-feed');
        this.postMusicBtn = document.getElementById('post-music-btn');
        this.spotifyModal = document.getElementById('spotify-modal');
        this.spotifySearchInput = document.getElementById('spotify-search-input');
        this.spotifyResults = document.getElementById('spotify-results');
    },

    addEventListeners() {
        if(this.openCreatePostModalBtn) this.openCreatePostModalBtn.addEventListener('click', () => this.openModal(this.createPostModal));
        
        if(this.createPostForm) this.createPostForm.addEventListener('submit', e => this.handleCreatePost(e));
        if(this.postTextInput) this.postTextInput.addEventListener('input', () => this.checkSubmitButtonState());
        if(this.addStoryForm) this.addStoryForm.addEventListener('submit', e => this.handlePostStory(e));
        if(this.postMediaBtn) this.postMediaBtn.addEventListener('click', () => this.postMediaInput.click());
        if(this.postMusicBtn) this.postMusicBtn.addEventListener('click', () => this.openSpotifyModal());
        if(this.postMediaInput) this.postMediaInput.addEventListener('change', e => this.previewPostMedia(e.target.files[0]));
        if(this.postMediaPreviewContainer) this.postMediaPreviewContainer.addEventListener('click', e => {
            if (e.target.closest('.remove-media-btn')) this.removePreviewPostMedia();
        });

        if(this.storiesSection) this.storiesSection.addEventListener('click', e => {
            const storyCard = e.target.closest('.story-card-v2');
            if (!storyCard) return;
            const user = storyCard.dataset.storyUser;
            if (user === 'add') {
                this.openAddStoryModal();
            } else {
                const userIndex = this.stories.findIndex(s => s.user === user);
                if (userIndex !== -1) this.openStoryViewer(userIndex);
            }
        });
        
        if(this.storyImageInput) this.storyImageInput.addEventListener('change', e => this.previewStoryImage(e.target.files[0]));
        if(this.storyPrevBtn) this.storyPrevBtn.addEventListener('click', (e) => { e.stopPropagation(); this.showPreviousStory(); });
        if(this.storyNextBtn) this.storyNextBtn.addEventListener('click', (e) => { e.stopPropagation(); this.showNextStory(); });
        
        if(this.feedContainer) this.feedContainer.addEventListener('click', e => {
            const likeBtn = e.target.closest('.post-action-btn[data-action="like"]');
            if (likeBtn) this.toggleLike(likeBtn.dataset.postId);
            
            const commentBtn = e.target.closest('.post-action-btn[data-action="comment"]');
            if (commentBtn) this.openCommentsModal(commentBtn.dataset.postId);

            if (window.MusicPlayer) {
                 const previewBtn = e.target.closest('.btn-play-preview');
                 if (previewBtn) window.MusicPlayer.handlePreviewClick(previewBtn);
            }
        });

        if(this.plogsGrid) this.plogsGrid.addEventListener('click', e => {
            const plog = e.target.closest('.plog-item');
            if (plog) {
                this.handlePlogClick(plog.dataset.plog);
            }
        });
        
        if (this.suggestionsList) this.suggestionsList.addEventListener('click', e => {
            const followBtn = e.target.closest('.btn-follow');
            if (followBtn) {
                this.handleFollowClick(followBtn);
            }
        });

        if(this.commentForm) this.commentForm.addEventListener('submit', e => this.handleTextComment(e));

        if(this.commentEmojiBtn) this.commentEmojiBtn.addEventListener('click', () => this.openEmojiModal());
        if(this.commentGifBtn) this.commentGifBtn.addEventListener('click', () => this.openGifModal());

        if(this.gifSearchInputFeed) this.gifSearchInputFeed.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') this.searchGifs(e.target.value);
        });

        if(this.gifPickerGridFeed) this.gifPickerGridFeed.addEventListener('click', (e) => {
            const gif = e.target.closest('.feed-gif-item');
            if (gif) {
                this.addComment('gif', gif.src);
                this.closeModal(this.gifPickerModalFeed);
            }
        });

        if(this.emojiPickerFeed) this.emojiPickerFeed.addEventListener('click', (e) => this.handleEmojiSelection(e));

        [this.createPostModal, this.addStoryModal, this.storyViewerModal, this.commentsModal, this.gifPickerModalFeed, this.emojiPickerModalFeed, this.spotifyModal, this.plogViewerModal].forEach(modal => {
            if(modal) modal.addEventListener('click', e => this.handleModalClose(e, modal));
        });
        
        if(this.spotifySearchInput) this.spotifySearchInput.addEventListener('keyup', e => this.handleSpotifySearch(e.target.value));
        if(this.spotifyResults) this.spotifyResults.addEventListener('click', e => {
            const songItem = e.target.closest('.spotify-result-item');
             if (songItem) {
                this.handleSpotifySelection({
                    title: songItem.dataset.title,
                    artist: songItem.dataset.artist,
                    artwork: songItem.dataset.artwork,
                    src: songItem.dataset.previewUrl,
                    url: songItem.dataset.url,
                });
            }
        });
    },

    loadData() {
        const loadFromStorage = (key, defaultValue) => JSON.parse(sessionStorage.getItem(key) || JSON.stringify(defaultValue));

        this.posts = loadFromStorage('conexo-posts-v2', [
             { id: 1, user: 'Ana', avatar: 'https://i.pinimg.com/736x/ad/b3/a9/adb3a95eb2128cd200d4f7c2d/c288e4.jpg', time: '2h', content: 'Finalmente platinei Elden Ring! Que jornada incrível. Recomendo a todos que amam um bom desafio. #eldenring #darksouls #fromsoftware', media: 'https://image.api.playstation.com/vulcan/ap/rnd/202108/0410/2ZTf4A03To2n1sVb6kAm9Y2S.jpg', likes: 156, comments: [{user: 'Carlos', avatar: 'https://i.pinimg.com/736x/32/b5/17/32b51754e1496531c11a027c9a185d24.jpg', type: 'text', content: 'Parabéns! É um feito e tanto.'}], liked: false, type: 'text' },
            { id: 2, user: 'Carlos', avatar: 'https://i.pinimg.com/736x/32/b5/17/32b51754e1496531c11a027c9a185d24.jpg', time: '5h', content: 'Meu novo setup está finalmente pronto! O que acharam da iluminação RGB?', media: 'https://images.unsplash.com/photo-1591465328140-2a0b38b2f301?q=80&w=800&auto=format&fit=crop', likes: 230, comments: [], liked: true, type: 'text' },
        ]);

        this.stories = loadFromStorage('conexo-stories-v2', [
            { user: 'Ana', avatar: 'https://i.pinimg.com/736x/ad/b3/a9/adb3a95eb2128cd200d4f7c2d/c288e4.jpg', time: '15m', items: [{ type: 'image', src: 'https://i.pinimg.com/1200x/8c/08/47/8c08476cefaf90f3a64408b286857e43.jpg'}] },
            { user: 'Carlos', avatar: 'https://i.pinimg.com/736x/32/b5/17/32b51754e1496531c11a027c9a185d24.jpg', time: '1h', items: [{ type: 'image', src: 'https://gameluster.com/wp-content/uploads/2023/05/vg.jpg'}] },
            { user: 'Mariana', avatar: 'https://i.pinimg.com/736x/c1/91/c2/c191c270d09a22bdfae381286de3f15d.jpg', time: '3h', items: [{ type: 'image', src: 'https://images.unsplash.com/photo-1542158399-885435b64234?q=80&w=800&auto=format&fit=crop'}] },
        ]);

        this.suggestions = loadFromStorage('conexo-suggestions', [
            { id: 'marcos', name: 'Marcos Vale', avatar: 'https://i.pinimg.com/736x/0f/1f/6b/0f1f6bcc56cfa1481fa9c07280cc0717.jpg', type: 'request'},
            { id: 'juliana', name: 'Juliana Reis', avatar: 'https://i.pinimg.com/736x/c1/91/c2/c191c270d09a22bdfae381286de3f15d.jpg', type: 'follow'},
        ]);

        this.voiceChannels = loadFromStorage('conexo-voice-channels', [
            { name: '# Bate-papo', members: 12, icon: 'fa-headset' },
            { name: '# Lofi & Chill', members: 42, icon: 'fa-music' },
            { name: '# Jogatina', members: 8, icon: 'fa-gamepad' },
        ]);
    },

    saveData() {
        sessionStorage.setItem('conexo-posts-v2', JSON.stringify(this.posts));
        sessionStorage.setItem('conexo-stories-v2', JSON.stringify(this.stories));
    },

    renderAll() {
        this.renderPosts();
        this.renderStories();
        this.renderSuggestions();
        this.renderVoiceChannels();
    },

    renderPosts() {
        if (!this.feedContainer) return;
        this.feedContainer.innerHTML = '';
        const allContent = [...this.posts];

        if (window.MusicPlayer && window.MusicPlayer.playlist) {
            window.MusicPlayer.playlist.forEach(track => {
                // Adiciona apenas músicas do Spotify que ainda não foram postadas
                if (track.src && track.src.includes('spotify') && !this.posts.some(p => p.preview_url === track.src)) {
                     allContent.push({
                        id: track.src, 
                        user: 'Você', 
                        avatar: this.currentUser.avatar,
                        time: 'Agora',
                        type: 'music',
                        title: track.title,
                        artist: track.artist,
                        artwork: track.artwork,
                        url: '#', // Placeholder, a URL completa não é mais necessária aqui
                        preview_url: track.src,
                        likes: 0,
                        comments: [],
                        liked: false,
                    });
                }
            });
        }

        allContent.sort((a, b) => (b.id > a.id) ? 1 : -1);

        allContent.forEach(post => {
            const postElement = this.createPostElement(post);
            this.feedContainer.insertAdjacentHTML('beforeend', postElement);
        });
    },

    createPostElement(post) {
        const mediaHTML = post.media ? `<div class="post-media"><img src="${post.media}" alt="Mídia do post"></div>` : '';
        const likedClass = post.liked ? 'liked' : '';
        const commentCount = post.comments ? post.comments.length : 0;
        
        if (post.type === 'music') {
            const previewButtonHTML = post.preview_url
                ? `<button class="btn-play-preview" data-preview-url="${post.preview_url}" title="Ouvir prévia de 30s">
                        <i class="fa-solid fa-play"></i>
                   </button>`
                : `<button class="btn-play-preview" disabled title="Prévia indisponível">
                        <i class="fa-solid fa-ban"></i>
                   </button>`;

            return `
            <article class="post-card music-post-card" data-post-id="${post.id}">
                <header class="post-header">
                    <img src="${post.avatar}" alt="Avatar de ${post.user}" class="post-avatar">
                    <div class="post-user-info">
                        <h4>${post.user}</h4>
                        <p>${post.time} &middot; <i class="fa-brands fa-spotify"></i></p>
                    </div>
                </header>
                <div class="music-card-body">
                    <img src="${post.artwork}" alt="Capa de ${post.title}" class="music-artwork">
                    <div class="music-info">
                        <div class="music-details">
                            <h3>${post.title}</h3>
                            <p>${post.artist}</p>
                        </div>
                        <div class="music-controls">
                            ${previewButtonHTML}
                            <a href="${post.url}" target="_blank" class="btn-open-spotify" title="Ouvir no Spotify">
                                <i class="fa-brands fa-spotify"></i>
                            </a>
                        </div>
                    </div>
                </div>
                <div class="post-stats">
                    <span>${post.likes} curtidas</span>
                    <span class="comment-count">${commentCount} comentários</span>
                </div>
                <div class="post-actions">
                    <button class="post-action-btn ${likedClass}" data-action="like" data-post-id="${post.id}"><i class="fa-solid fa-heart"></i> Curtir</button>
                    <button class="post-action-btn" data-action="comment" data-post-id="${post.id}"><i class="fa-solid fa-comment"></i> Comentar</button>
                    <button class="post-action-btn" data-action="share"><i class="fa-solid fa-share"></i> Compartilhar</button>
                </div>
            </article>
            `;
        }

        return `
            <article class="post-card" data-post-id="${post.id}">
                <header class="post-header">
                    <img src="${post.avatar}" alt="Avatar de ${post.user}" class="post-avatar">
                    <div class="post-user-info">
                        <h4>${post.user}</h4>
                        <p>${post.time}</p>
                    </div>
                </header>
                <div class="post-body">
                    <p class="post-text">${post.content}</p>
                    ${mediaHTML}
                </div>
                <div class="post-stats">
                    <span>${post.likes} curtidas</span>
                    <span class="comment-count">${commentCount} comentários</span>
                </div>
                <div class="post-actions">
                    <button class="post-action-btn ${likedClass}" data-action="like" data-post-id="${post.id}">
                        <i class="fa-solid fa-heart"></i> Curtir
                    </button>
                    <button class="post-action-btn" data-action="comment" data-post-id="${post.id}">
                        <i class="fa-solid fa-comment"></i> Comentar
                    </button>
                    <button class="post-action-btn" data-action="share">
                        <i class="fa-solid fa-share"></i> Compartilhar
                    </button>
                </div>
            </article>
        `;
    },

    renderSuggestions() {
        if (!this.suggestionsList) return;
        this.suggestionsList.innerHTML = '';
        this.suggestions.forEach(user => {
            this.suggestionsList.innerHTML += `
                <li>
                    <div class="user-info-sidebar">
                        <img src="${user.avatar}" alt="Avatar de ${user.name}">
                        <span>${user.name}</span>
                    </div>
                    <button class="btn-follow" data-user-type="${user.type}">Seguir</button>
                </li>
            `;
        });
    },
    
    handleFollowClick(button) {
        const userType = button.dataset.userType;
        if (button.classList.contains('requested') || button.classList.contains('following')) return;

        if (userType === 'request') {
            button.textContent = 'Enviado';
            button.classList.add('requested');
            this.showToast('Solicitação enviada!');
        } else { // 'follow'
            button.textContent = 'Seguindo';
            button.classList.add('following');
            this.showToast('Você começou a seguir!');
        }
    },

    renderVoiceChannels() {
        if (!this.voiceChannelsList) return;
        this.voiceChannelsList.innerHTML = '';
        this.voiceChannels.forEach(channel => {
            this.voiceChannelsList.innerHTML += `
                 <li>
                    <div class="channel-info">
                        <i class="fa-solid ${channel.icon}"></i>
                        <div>
                            <span>${channel.name}</span>
                            <p>${channel.members} pessoas online</p>
                        </div>
                    </div>
                    <a href="#/chat" class="btn-join">Entrar</a>
                </li>
            `;
        });
    },
    
    handleCreatePost(event) {
        event.preventDefault();
        const text = this.postTextInput.value.trim();
        const file = this.stagedPostFile;

        if (!text && !file) return;

        const newPost = {
            id: Date.now(),
            user: this.currentUser.name,
            avatar: this.currentUser.avatar,
            time: 'Agora',
            content: text,
            likes: 0,
            comments: [],
            liked: false,
            type: 'text'
        };

        const addPost = (mediaUrl = null) => {
            if (mediaUrl) newPost.media = mediaUrl;
            this.posts.push(newPost);
            this.saveData();
            this.renderPosts();
            this.closeModal(this.createPostModal);
        };
        
        if (file) {
            const reader = new FileReader();
            reader.onload = e => addPost(e.target.result);
            reader.readAsDataURL(file);
        } else {
            addPost();
        }
    },
    
    toggleLike(postId) {
        const post = this.posts.find(p => p.id == postId);
        if (!post) return;
        
        post.liked = !post.liked;
        post.liked ? post.likes++ : post.likes--;
        
        this.saveData();
        
        const postElement = this.feedContainer.querySelector(`[data-post-id="${postId}"]`);
        if (postElement) {
            const likeBtn = postElement.querySelector('.post-action-btn[data-action="like"]');
            const stats = postElement.querySelector('.post-stats span:first-child');
            likeBtn.classList.toggle('liked', post.liked);
            stats.textContent = `${post.likes} curtidas`;
        }
    },

    previewPostMedia(file) {
        if (!file) return;
        this.stagedPostFile = file;
        const reader = new FileReader();
        reader.onload = e => {
            this.postMediaPreviewContainer.innerHTML = `<img src="${e.target.result}" alt="Preview"><button type="button" class="remove-media-btn"><i class="fa-solid fa-times"></i></button>`;
            this.postMediaPreviewContainer.classList.remove('hidden');
            this.checkSubmitButtonState();
        };
        reader.readAsDataURL(file);
    },

    removePreviewPostMedia() {
        this.stagedPostFile = null;
        this.postMediaPreviewContainer.innerHTML = '';
        this.postMediaPreviewContainer.classList.add('hidden');
        this.postMediaInput.value = '';
        this.checkSubmitButtonState();
    },

    checkSubmitButtonState() {
        const hasText = this.postTextInput.value.trim().length > 0;
        const hasMedia = !!this.stagedPostFile;
        this.submitPostBtn.disabled = !hasText && !hasMedia;
    },
    
    renderStories() {
        if (!this.storiesSection) return;
        const staticAddCard = this.storiesSection.querySelector('.add-story');
        this.storiesSection.innerHTML = '';
        if (staticAddCard) {
            this.storiesSection.appendChild(staticAddCard);
        }
        this.stories.forEach(story => {
            const storyEl = this.createStoryElement(story);
            this.storiesSection.appendChild(storyEl);
        });
    },

    createStoryElement(story) {
        const storyCard = document.createElement('div');
        storyCard.className = 'story-card-v2';
        storyCard.dataset.storyUser = story.user;
        const storyBgSrc = story.items && story.items[0] ? story.items[0].src : '';
        storyCard.innerHTML = `
            <img src="${storyBgSrc}" alt="Sinal de ${story.user}" class="story-card-v2-bg">
            <div class="story-card-v2-overlay">
                 <img src="${story.avatar}" alt="Avatar" class="story-card-v2-avatar">
                <span class="story-card-v2-user">${story.user}</span>
            </div>`;
        return storyCard;
    },
    
    openAddStoryModal() {
        this.addStoryForm.reset();
        this.stagedStoryFile = null;
        this.submitStoryBtn.disabled = true;
        this.storyImageUploadArea.classList.remove('has-image');
        this.storyImagePreviewContainer.innerHTML = ``;
        this.openModal(this.addStoryModal);
    },
    
    previewStoryImage(file) {
        if (!file) return;
        this.stagedStoryFile = file;
        this.submitStoryBtn.disabled = false;
        const reader = new FileReader();
        reader.onload = e => {
            this.storyImagePreviewContainer.innerHTML = `<img src="${e.target.result}" alt="Pré-visualização do Sinal">`;
            this.storyImageUploadArea.classList.add('has-image');
        };
        reader.readAsDataURL(file);
    },

    handlePostStory(event) {
        event.preventDefault();
        const file = this.stagedStoryFile;
        if (!file) return;

        const reader = new FileReader();
        reader.onload = e => {
            const newStoryItem = { type: 'image', src: e.target.result };
            let userStory = this.stories.find(s => s.user === this.currentUser.name);

            if (userStory) {
                userStory.items.push(newStoryItem);
            } else {
                this.stories.unshift({
                    user: this.currentUser.name,
                    avatar: this.currentUser.avatar,
                    time: 'Agora',
                    items: [newStoryItem]
                });
            }
            
            this.saveData();
            this.renderStories();
            this.closeModal(this.addStoryModal);
        };
        reader.readAsDataURL(file);
    },
    
    openStoryViewer(userIndex) {
        clearTimeout(this.storyTimer);
        this.currentStoryUserIndex = userIndex;
        const storyData = this.stories[userIndex];
        if (!storyData || !storyData.items.length) return;
        const storyItem = storyData.items[0];

        this.storyViewerAvatar.src = storyData.avatar;
        this.storyViewerUsername.textContent = storyData.user;
        this.storyViewerTimestamp.textContent = storyData.time;
        this.storyViewerMedia.src = storyItem.src;

        this.storyProgressBarsContainer.innerHTML = `<div class="story-progress-bar"><div class="progress-bar-inner"></div></div>`;
        this.openModal(this.storyViewerModal);
        
        setTimeout(() => {
            const progressBarInner = this.storyProgressBarsContainer.querySelector('.progress-bar-inner');
            if (progressBarInner) {
                progressBarInner.style.animation = 'fillProgress 5s linear forwards';
            }
        }, 10);
        
        this.storyTimer = setTimeout(() => this.showNextStory(), 5000);
    },

    showNextStory() {
        const nextIndex = (this.currentStoryUserIndex + 1) % this.stories.length;
        this.openStoryViewer(nextIndex);
    },

    showPreviousStory() {
        const prevIndex = (this.currentStoryUserIndex - 1 + this.stories.length) % this.stories.length;
        this.openStoryViewer(prevIndex);
    },

    openCommentsModal(postId) {
        this.activePostIdForComment = postId;
        const post = this.posts.find(p => p.id == postId);
        if (!post) return;

        this.commentsModalTitle.textContent = `Comentários sobre o post de ${post.user}`;
        this.renderComments(post);
        this.openModal(this.commentsModal);
    },

    renderComments(post) {
        this.commentsList.innerHTML = '';
        if (!post.comments || post.comments.length === 0) {
            this.commentsList.innerHTML = '<p class="empty-list-message">Nenhum comentário ainda. Seja o primeiro!</p>';
            return;
        }

        post.comments.forEach(comment => {
            const commentEl = document.createElement('div');
            commentEl.className = 'comment-item';
            
            let contentHTML = '';
            if (comment.type === 'gif') {
                contentHTML = `<img src="${comment.content}" alt="GIF Comment" class="comment-media">`;
            } else { // Default to text
                contentHTML = `<p>${comment.content}</p>`;
            }

            commentEl.innerHTML = `
                <img src="${comment.avatar}" alt="Avatar de ${comment.user}">
                <div class="comment-content">
                    <strong>${comment.user}</strong>
                    ${contentHTML}
                </div>
            `;
            this.commentsList.appendChild(commentEl);
        });
    },

    handleTextComment(event) {
        event.preventDefault();
        const commentText = this.commentInput.value.trim();
        if (!commentText) return;

        this.addComment('text', commentText);
        this.commentInput.value = '';
    },

    addComment(type, content) {
        if (!this.activePostIdForComment) return;
        const post = this.posts.find(p => p.id == this.activePostIdForComment);
        if (!post) return;

        const newComment = {
            user: this.currentUser.name,
            avatar: this.currentUser.avatar,
            type: type,
            content: content
        };

        post.comments.push(newComment);
        this.saveData();
        
        this.renderComments(post);
        this.updateCommentCountOnPost(post.id);
    },

    updateCommentCountOnPost(postId) {
        const post = this.posts.find(p => p.id == postId);
        if (!post) return;
        
        const postElement = this.feedContainer.querySelector(`[data-post-id="${postId}"]`);
        if (postElement) {
            const countElement = postElement.querySelector('.comment-count');
            countElement.textContent = `${post.comments.length} comentários`;
        }
    },
    
    populateEmojiPicker() {
        if (!this.emojiPickerFeed) return;
        const emojis = ['😀', '😂', '😍', '🤔', '😢', '😡', '👍', '👎', '❤️', '🔥', '🚀', '🎉', '👋', '🙏', '💯', '👏', '👀', '😎', '😜', '😇', '🤯', '🥳', '😭', '😱', '🤢', '🥺', '😏', '🧐', '🤖', '👻', '💀', '👽', '👾', '😴', '🧠', '👑', '💎', '🎮', '🎲', '🍔', '🍕', '🍿', '🍩', '🍺', '🍾', '🎁', '🎈'];
        this.emojiPickerFeed.innerHTML = '';
        emojis.forEach(emoji => {
            const btn = document.createElement('button');
            btn.textContent = emoji;
            this.emojiPickerFeed.appendChild(btn);
        });
    },

    openEmojiModal() {
        if (this.emojiPickerModalFeed) this.openModal(this.emojiPickerModalFeed);
    },

    handleEmojiSelection(event) {
        const emojiButton = event.target.closest('button');
        if (emojiButton && this.commentInput) {
            this.commentInput.value += emojiButton.textContent;
            this.commentInput.focus();
            if (this.emojiPickerModalFeed) this.closeModal(this.emojiPickerModalFeed);
        }
    },

    async openGifModal() {
        if (this.gifPickerModalFeed) {
            this.openModal(this.gifPickerModalFeed);
            this.gifPickerGridFeed.innerHTML = '<div class="spinner"></div>';
            await this.searchGifs('trending');
        }
    },

    async searchGifs(query) {
        this.gifPickerGridFeed.innerHTML = '<div class="spinner"></div>';
        const url = query === 'trending' 
            ? `https://api.giphy.com/v1/gifs/trending?api_key=${this.giphyApiKey}&limit=20` 
            : `https://api.giphy.com/v1/gifs/search?api_key=${this.giphyApiKey}&q=${query}&limit=20`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            this.gifPickerGridFeed.innerHTML = data.data.map(gif => `<img src="${gif.images.fixed_height_small.url}" alt="${gif.title}" class="feed-gif-item">`).join('');
        } catch (error) {
            this.gifPickerGridFeed.innerHTML = '<p>Não foi possível carregar.</p>';
        }
    },

    // --- SPOTIFY METHODS ---
    openSpotifyModal() {
        if(this.spotifyModal) {
            this.spotifyModal.classList.remove('hidden');
            this.spotifyResults.innerHTML = '<p class="empty-list-message">Comece a digitar para buscar uma música.</p>';
            this.spotifySearchInput.focus();
        }
    },

    async handleSpotifySearch(query) {
        if (!query.trim()) {
            this.spotifyResults.innerHTML = '<p class="empty-list-message">Comece a digitar para buscar uma música.</p>';
            return;
        }

        const token = await getAccessToken();
        if (!token) {
            this.spotifyResults.innerHTML = `<p class="empty-list-message">Erro de autenticação com o Spotify.</p>`;
            return;
        }

        this.spotifyResults.innerHTML = '<div class="spinner"></div>';

        try {
            const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=15`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Falha na busca do Spotify.');

            const data = await response.json();
            this.spotifyResults.innerHTML = '';
            if (data.tracks.items.length === 0) {
                this.spotifyResults.innerHTML = `<p class="empty-list-message">Nenhuma música encontrada.</p>`;
                return;
            }

            data.tracks.items.forEach(track => {
                const artwork = track.album.images[0]?.url || 'https://placehold.co/50x50';
                const artists = track.artists.map(artist => artist.name).join(', ');
                this.spotifyResults.innerHTML += `
                    <div class="spotify-result-item" 
                         data-title="${track.name}" 
                         data-artist="${artists}" 
                         data-artwork="${artwork}" 
                         data-preview-url="${track.preview_url || ''}"
                         data-url="${track.external_urls.spotify}">
                        <img src="${artwork}" alt="Capa de ${track.name}">
                        <div class="spotify-result-info">
                            <h4>${track.name}</h4>
                            <p>${artists}</p>
                        </div>
                    </div>`;
            });

        } catch (error) {
            console.error("Erro na busca do Spotify:", error);
            this.spotifyResults.innerHTML = `<p class="empty-list-message">Ocorreu um erro ao buscar.</p>`;
        }
    },

    handleSpotifySelection(songData) {
        const newPost = {
            id: Date.now(),
            user: this.currentUser.name,
            avatar: this.currentUser.avatar,
            time: 'Agora',
            type: 'music',
            title: songData.title,
            artist: songData.artist,
            artwork: songData.artwork,
            url: songData.url,
            preview_url: songData.src,
            likes: 0,
            comments: [],
            liked: false
        };
        
        this.posts.unshift(newPost);
        this.saveData();
        this.renderPosts();
        this.closeModal(this.spotifyModal);
        this.closeModal(this.createPostModal);
    },
    
    handlePlogClick(plogName) {
        if (plogName === 'live') {
            this.showToast('Nenhuma transmissão ao vivo no momento.');
            return;
        }

        if (plogName === 'game') {
            window.location.hash = '#/game';
            return;
        }

        this.openPlogModal(plogName);
    },

    openPlogModal(plogName) {
        if (!this.plogViewerModal) return;
        
        this.plogModalTitle.textContent = '';
        this.plogModalContent.innerHTML = '<div class="spinner"></div>';
        this.openModal(this.plogViewerModal);

        let title = '';
        let contentHTML = '';

        setTimeout(() => {
             if (plogName === 'pixelart') {
                title = 'Galeria Pixel Art';
                contentHTML = `
                    <div class="plog-content-pixelart-grid">
                        <div class="plog-pixel-item"><img src="https://i.pinimg.com/originals/36/a4/75/36a47579511bcddf77651709e88357e8.jpg" alt="Pixel Art"></div>
                        <div class="plog-pixel-item"><img src="https://i.pinimg.com/564x/0f/d0/10/0fd010a3318c41493cb2d5069daf6759.jpg" alt="Pixel Art"></div>
                        <div class="plog-pixel-item"><img src="https://i.pinimg.com/564x/e7/d7/21/e7d72111532f416550742187b3260769.jpg" alt="Pixel Art"></div>
                        <div class="plog-pixel-item"><img src="https://i.pinimg.com/564x/9e/c8/b6/9ec8b6ea40c5f49b8004f25bacc4312d.jpg" alt="Pixel Art"></div>
                    </div>
                `;
            } else if (plogName === 'synthwave') {
                title = 'Rádio Synthwave FM';
                contentHTML = `
                    <div class="plog-content-synthwave">
                        <iframe src="https://www.youtube.com/embed/4xDzrJKXOOY?autoplay=1" 
                                title="YouTube video player" 
                                frameborder="0" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowfullscreen>
                        </iframe>
                    </div>
                    <p style="color: var(--text-secondary); margin-top: 1rem; font-size: 0.9rem;">Sintonizado em Lofi.co</p>
                `;
            }

            this.plogModalTitle.textContent = title;
            this.plogModalContent.innerHTML = contentHTML;
        }, 400); 
    },

    showToast(message) {
        if (!this.toastMessage) return;
        this.toastMessage.textContent = message;
        this.toastMessage.classList.add('show');
        setTimeout(() => {
            this.toastMessage.classList.remove('show');
        }, 3000);
    },

    openModal(modal) {
        if(modal) modal.classList.remove('hidden');
    },

    closeModal(modal) {
        if(modal) modal.classList.add('hidden');
        if (modal && modal.id === 'create-post-modal') {
             this.createPostForm.reset();
             this.removePreviewPostMedia();
        }
        if (modal && modal.id === 'story-viewer-modal-v2') {
            clearTimeout(this.storyTimer);
            const progressBarInner = this.storyProgressBarsContainer.querySelector('.progress-bar-inner');
            if(progressBarInner) progressBarInner.style.animation = 'none';
        }
        if (modal && modal.id === 'plog-viewer-modal') {
            this.plogModalContent.innerHTML = '';
        }
    },
    
    handleModalClose(event, modal) {
        if (event.target.classList.contains('modal-overlay') || event.target.closest('.close-modal-btn')) {
            this.closeModal(modal);
        }
    },
};