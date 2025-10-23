// =================================
//  MÓDULO DE LÓGICA DA "CENTRAL DE ALERTAS"
// =================================
export const Notifications = {
    initialNotifications: [
        { id: '1', type: 'follow', user: 'Ana Livia', avatar: 'https://i.pinimg.com/736x/ad/b3/a9/adb3a95eb2128cd200d4f7c2d/c288e4.jpg', message: 'começou a seguir você.', isNew: true, actionBtn: { text: 'Seguir de volta', class: 'btn-primary', action: 'follow-back' } },
        { id: '2', type: 'like', user: 'Marcos Vale', avatar: 'https://i.pinimg.com/736x/0f/1f/6b/0f1f6bcc56cfa1481fa9c07280cc0717.jpg', message: 'curtiu sua foto.', isNew: true, postThumb: 'https://images.unsplash.com/photo-1542158399-885435b64234?q=80&w=100&auto=format&fit=crop', actionBtn: { text: 'Ver Publicação', class: 'btn-secondary', action: 'view-post' } },
        { id: '6', type: 'community-invite', user: 'Devs & Café', avatar: 'https://i.pinimg.com/736x/e3/19/36/e31936c2ffddedc3123b0ae87e916cb4.jpg', message: 'convidou você para se juntar à comunidade.', isNew: true, actionBtn: { text: 'Aceitar', class: 'btn-primary', action: 'accept-community'}},
        { id: '7', type: 'system', user: 'Conectare Suporte', avatar: 'https://i.pinimg.com/736x/e3/19/36/e31936c2ffddedc3123b0ae87e916cb4.jpg', message: 'Uma nova atualização de segurança foi aplicada na plataforma.', isNew: false, actionBtn: { text: 'Saiba Mais', class: 'btn-secondary', action: 'get-help' } },
        { id: '3', type: 'comment', user: 'Juliana Reis', avatar: 'https://i.pinimg.com/736x/c1/91/c2/c191c270d09a22bdfae381286de3f15d.jpg', message: 'comentou: "Que lugar incrível! 🤩"', isNew: false, postThumb: 'https://images.unsplash.com/photo-1542158399-885435b64234?q=80&w=100&auto=format&fit=crop', actionBtn: { text: 'Responder', class: 'btn-primary', action: 'reply-comment' } },
        { id: '5', type: 'mention', user: 'Carlos Souza', avatar: 'https://i.pinimg.com/736x/32/b5/17/32b51754e1486531c11a027c9a185d24.jpg', message: 'mencionou você em um comentário.', isNew: false, postThumb: 'https://gameluster.com/wp-content/uploads/2023/05/vg.jpg', actionBtn: { text: 'Ver Comentário', class: 'btn-secondary', action: 'view-post'}},
    ],
    notifications: [],
    activeTab: 'all',

    init() {
        if (!document.querySelector('.content-notifications')) return;
        this.cacheDOMElements();
        this.loadNotifications();
        this.addEventListeners();
        this.renderNotifications();
    },

    cacheDOMElements() {
        this.clearAllBtn = document.querySelector('.btn-clear-all');
        this.tabLinks = document.querySelectorAll('.alert-filter-link');
        this.tabPanes = document.querySelectorAll('.tab-pane');
        this.lists = {
            all: document.getElementById('notificationListAll'),
            engagement: document.getElementById('notificationListEngagement'),
            requests: document.getElementById('notificationListRequests'),
            events: document.getElementById('notificationListEvents'),
            system: document.getElementById('notificationListSystem'),
        };
        this.emptyStates = {
            all: document.getElementById('no-notifications-message-all'),
            engagement: document.getElementById('no-notifications-message-engagement'),
            requests: document.getElementById('no-notifications-message-requests'),
            events: document.getElementById('no-notifications-message-events'),
            system: document.getElementById('no-notifications-message-system'),
        };
        this.confirmationModal = document.getElementById('confirmation-modal');
        this.confirmClearAllBtn = document.getElementById('confirm-clear-all-btn');
        this.cancelClearAllBtn = document.getElementById('cancel-clear-all-btn');
        this.toastMessage = document.getElementById('toast-message');
        this.toastText = document.getElementById('toast-text');
    },

    addEventListeners() {
         if (this.clearAllBtn) this.clearAllBtn.addEventListener('click', () => this.openConfirmationModal());
         if (this.confirmClearAllBtn) this.confirmClearAllBtn.addEventListener('click', () => this.confirmClearAll());
         if (this.cancelClearAllBtn) this.cancelClearAllBtn.addEventListener('click', () => this.closeModal(this.confirmationModal));
         document.querySelectorAll('.close-modal-btn').forEach(btn => btn.addEventListener('click', (e) => this.closeModal(e.target.closest('.modal-overlay'))));
         this.tabLinks.forEach(link => link.addEventListener('click', (e) => this.activateTab(e.target.dataset.tab)));
         document.addEventListener('click', (e) => {
            const item = e.target.closest('.alert-item');
            if (!item) return;
            const id = item.dataset.notificationId;
            if (e.target.closest('.dismiss-alert-btn')) {
                e.stopPropagation();
                this.dismissNotification(id);
            }
            else if (e.target.closest('.action-button')) {
                e.stopPropagation();
                this.handleNotificationAction(id, e.target.closest('.action-button').dataset.action, e.target.closest('.action-button'));
            }
            else this.markNotificationAsRead(id);
         });
    },

    loadNotifications() {
        const saved = sessionStorage.getItem('notifications');
        this.notifications = saved ? JSON.parse(saved) : JSON.parse(JSON.stringify(this.initialNotifications));
    },

    saveNotifications() {
        sessionStorage.setItem('notifications', JSON.stringify(this.notifications));
    },
    
    addNotification(data) {
        data.id = Date.now().toString();
        data.isNew = true;
        this.notifications.unshift(data);
        this.saveNotifications();
        
        if (window.location.hash.includes('#/notificacoes')) {
            this.renderNotifications();
        }
    },

    renderNotifications() {
        Object.values(this.lists).forEach(list => list.innerHTML = '');
        Object.values(this.emptyStates).forEach(state => state.classList.add('hidden'));
    
        const filters = {
            all: () => true,
            engagement: n => ['like', 'comment', 'mention'].includes(n.type),
            requests: n => ['follow', 'community-invite'].includes(n.type),
            events: n => n.type === 'live_event',
            system: n => n.type === 'system'
        };
    
        for (const tab in this.lists) {
            const filtered = this.notifications.filter(filters[tab]);
            if (filtered.length > 0) {
                this.emptyStates[tab].classList.add('hidden');
                filtered.forEach(n => this.appendNotification(n, this.lists[tab]));
            } else {
                this.emptyStates[tab].classList.remove('hidden');
            }
        }
        this.clearAllBtn.classList.toggle('hidden', this.notifications.length === 0);
    },
    
    getAlertTypeClass(type) {
        const typeMap = {
            follow: 'type-social',
            like: 'type-social',
            comment: 'type-social',
            mention: 'type-social',
            'community-invite': 'type-community',
            live_event: 'type-event',
            system: 'type-system'
        };
        return typeMap[type] || 'type-social';
    },

    appendNotification(n, listElement) {
         const iconMap = { follow: 'fa-user-plus', like: 'fa-heart', comment: 'fa-comment', 'community-invite': 'fa-users', mention: 'fa-at', live_event: 'fa-satellite-dish', system: 'fa-info-circle' };
         const iconClass = iconMap[n.type] || 'fa-bell';
         const postThumb = n.postThumb ? `<img src="${n.postThumb}" alt="Post" class="alert-post-thumb">` : '';
         const actionButton = n.actionBtn ? `<button class="${n.actionBtn.class} action-button" data-action="${n.actionBtn.action}">${n.actionBtn.text}</button>` : '';
         const liveIndicator = n.type === 'live_event' ? '<span class="live-indicator">AO VIVO</span>' : '';

         const itemHTML = `
            <div class="alert-icon-wrapper">
                <i class="fa-solid ${iconClass}"></i>
            </div>
            <div class="alert-content">
                <img src="${n.avatar}" alt="Avatar" class="alert-avatar">
                <p><strong>${n.user}</strong> ${n.message}</p>
            </div>
            <div class="alert-actions">
                ${liveIndicator}
                ${postThumb}
                ${actionButton}
                <button class="dismiss-alert-btn" title="Descartar"><i class="fa-solid fa-xmark"></i></button>
            </div>
         `;
         const itemDiv = document.createElement('div');
         itemDiv.className = `alert-item ${this.getAlertTypeClass(n.type)} ${n.isNew ? 'new' : ''}`;
         itemDiv.dataset.notificationId = n.id;
         itemDiv.innerHTML = itemHTML;
         listElement.appendChild(itemDiv);

         itemDiv.addEventListener('mousemove', e => this.apply3DTilt(e, itemDiv));
         itemDiv.addEventListener('mouseleave', () => this.reset3DTilt(itemDiv));
    },
    
    apply3DTilt(e, element) {
        const rect = element.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = element.offsetWidth / 2;
        const centerY = element.offsetHeight / 2;
        const deltaX = x - centerX;
        const deltaY = y - centerY;
        const maxRotation = 8; 
        const rotateX = (deltaY / centerY) * -maxRotation;
        const rotateY = (deltaX / centerX) * maxRotation;
        element.style.transition = 'transform 0.05s linear';
        element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.04, 1.04, 1.04)`;
    },

    reset3DTilt(element) {
        element.style.transition = 'transform 0.4s cubic-bezier(0.23, 1, 0.32, 1)';
        element.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    },

    activateTab(tabId) {
        this.activeTab = tabId;
        this.tabLinks.forEach(link => link.classList.toggle('active', link.dataset.tab === tabId));
        this.tabPanes.forEach(pane => pane.classList.toggle('active', pane.id === tabId));
    },

    dismissNotification(id) {
        const itemEl = document.querySelector(`[data-notification-id="${id}"]`);
        if(itemEl) {
             itemEl.classList.add('dismissing');
             itemEl.addEventListener('transitionend', () => {
                this.notifications = this.notifications.filter(n => n.id != id);
                this.saveNotifications();
                this.renderNotifications();
             }, { once: true });
        }
    },

    confirmClearAll() {
        document.querySelectorAll('.alert-item').forEach(item => item.classList.add('dismissing'));
        setTimeout(() => {
            this.notifications = [];
            this.saveNotifications();
            this.renderNotifications();
            this.closeModal(this.confirmationModal);
            this.showToast('Todos os alertas foram limpos!');
        }, 400);
    },

    handleNotificationAction(id, action, button) {
        const notification = this.notifications.find(n => n.id == id);
        if (!notification) return;

        switch (action) {
            case 'follow-back':
                button.textContent = 'Seguindo';
                button.disabled = true;
                button.classList.remove('btn-primary');
                button.classList.add('btn-secondary');
                this.showToast(`Você agora está seguindo ${notification.user}!`);
                break;
            case 'accept-community':
                button.textContent = 'Inscrito';
                button.disabled = true;
                this.showToast(`Você entrou na comunidade ${notification.user}!`);
                window.location.hash = '#/comunidade';
                break;
            case 'view-profile':
                 window.location.hash = '#/profile';
                 break;
            case 'view-community':
                 window.location.hash = '#/comunidade';
                 break;
            case 'reply-comment':
            case 'view-post':
                window.location.hash = '#/feed';
                break;
            case 'get-help':
                window.location.hash = '#/ajuda';
                break;
        }
    },
    
    markNotificationAsRead(id) {
        const notification = this.notifications.find(n => n.id == id);
        if (notification && notification.isNew) {
            notification.isNew = false;
            this.saveNotifications();
            const itemEl = document.querySelector(`[data-notification-id="${id}"]`);
            if(itemEl) itemEl.classList.remove('new');
        }
    },

    openConfirmationModal() { this.confirmationModal.classList.remove('hidden'); },
    closeModal(modal) {
        if(modal) modal.classList.add('hidden');
    },

    showToast(message) {
        if (this.toastMessage && this.toastText) {
            this.toastText.textContent = message;
            this.toastMessage.classList.add('show');
            setTimeout(() => this.toastMessage.classList.remove('show'), 3000);
        }
    },
};
