// =================================
//  MÓDULO DE LÓGICA DA PÁGINA DE CHAMADA (DINÂMICO)
// =================================
// NOTA: Nenhuma alteração funcional foi necessária.
// O código é compatível com a nova estrutura HTML e CSS.

export const Call = {
    callState: 'ringing',
    micOn: true,
    cameraOn: true,
    callTimer: null,
    callDuration: 0,
    // Banco de dados centralizado de usuários para a chamada
    userData: {
        '1': {
            name: "Ana",
            avatar: "https://i.pinimg.com/736x/ad/b3/a9/adb3a95eb2128cd200d4f7c2d/c288e4.jpg",
            remoteVideoSrc: "https://www.w3schools.com/html/mov_bbb.mp4"
        },
        '2': {
            name: "Carlos",
            avatar: "https://i.pinimg.com/736x/32/b5/17/32b51754e1496531c11a027c9a185d24.jpg",
            remoteVideoSrc: "https://www.w3schools.com/html/mov_bbb.mp4"
        },
        '3': {
             name: "Mariana",
            avatar: "https://i.pinimg.com/736x/c1/91/c2/c191c270d09a22bdfae381286de3f15d.jpg",
            remoteVideoSrc: "https://www.w3schools.com/html/mov_bbb.mp4"
        },
        '4': {
             name: "Kleitinho",
            avatar: "https://placehold.co/100x100/1e1e1e/ffffff?text=K",
            remoteVideoSrc: "https://www.w3schools.com/html/mov_bbb.mp4"
        }
    },
    currentUser: null,
    currentUserId: null,

    init() {
        if (!document.querySelector('.call-container')) return;

        this.cacheDOMElements();
        
        // Determina quem está na chamada pela URL
        this.urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
        this.currentUserId = this.urlParams.get('user');
        this.callType = this.urlParams.get('type') || 'voice'; // Default para voz se não especificado

        if (this.currentUserId && this.userData[this.currentUserId]) {
            this.currentUser = this.userData[this.currentUserId];
            this.addEventListeners();
            this.loadCustomBackground();
            this.runCallSimulation();
        } else {
            console.error("ID de usuário inválido ou não encontrado na URL.");
            this.displayErrorState();
        }
    },

    cacheDOMElements() {
        this.callContainer = document.getElementById('callContainer');
        this.callStatusText = document.getElementById('callStatusText');
        this.callerAvatar = document.getElementById('callerAvatar');
        this.callerName = document.getElementById('callerName');
        this.remoteVideo = document.getElementById('remoteVideo');
        this.customBackgroundImage = document.getElementById('customBackgroundImage');
        this.localVideo = document.getElementById('localVideo');
        this.toggleMicBtn = document.getElementById('toggleMicBtn');
        this.toggleCameraBtn = document.getElementById('toggleCameraBtn');
        this.endCallBtn = document.getElementById('endCallBtn');
        this.changeBackgroundBtn = document.getElementById('changeBackgroundBtn');
        this.backgroundUploadInput = document.getElementById('backgroundUploadInput');
    },

    addEventListeners() {
        this.toggleMicBtn.addEventListener('click', () => this.toggleMic());
        this.toggleCameraBtn.addEventListener('click', () => this.toggleCamera());
        this.endCallBtn.addEventListener('click', () => this.updateCallState('ended'));
        this.changeBackgroundBtn.addEventListener('click', () => this.backgroundUploadInput.click());
        this.backgroundUploadInput.addEventListener('change', (e) => this.handleBackgroundUpload(e));
    },
    
    runCallSimulation() {
        this.updateCallState('ringing');
        setTimeout(() => this.updateCallState('connecting'), 3000);
        setTimeout(() => this.updateCallState('in-call'), 5000);
    },

    displayErrorState() {
        this.callerName.textContent = "Erro na Chamada";
        this.callerAvatar.src = "https://placehold.co/120x120/e0245e/white?text=!";
        this.callStatusText.textContent = "Usuário não encontrado";
    },

    loadCustomBackground() {
        const savedBackground = localStorage.getItem(`${this.currentUserId}CallBackground`);
        if (savedBackground) {
            this.customBackgroundImage.style.backgroundImage = `url('${savedBackground}')`;
            this.customBackgroundImage.style.display = 'block';
            this.remoteVideo.style.display = 'none';
            this.remoteVideo.pause();
        } else {
            this.customBackgroundImage.style.backgroundImage = 'none';
            this.customBackgroundImage.style.backgroundColor = 'transparent'; // Fundo principal já é escuro
            this.customBackgroundImage.style.display = 'block';

            if (this.callType === 'video') {
                this.remoteVideo.style.display = 'block';
                this.remoteVideo.play().catch(e => console.error("Erro ao tentar reproduzir vídeo remoto:", e));
            } else {
                this.remoteVideo.style.display = 'none';
                this.remoteVideo.pause();
            }
        }
    },

    updateCallState(newState) {
        this.callState = newState;
        this.callContainer.className = `call-container call-state-${newState}`;

        switch (newState) {
            case 'ringing':
                this.callStatusText.textContent = "Chamando...";
                this.callerName.textContent = this.currentUser.name;
                this.callerAvatar.src = this.currentUser.avatar;
                this.remoteVideo.src = this.currentUser.remoteVideoSrc;
                this.remoteVideo.load();

                const hasCustomBg = !!localStorage.getItem(`${this.currentUserId}CallBackground`);

                if (this.callType === 'video' && !hasCustomBg) {
                    this.remoteVideo.play().catch(e => console.error("Erro ao tentar reproduzir vídeo remoto:", e));
                    this.remoteVideo.style.display = 'block';
                    this.callerAvatar.style.display = 'none';
                } else {
                    this.remoteVideo.pause();
                    this.remoteVideo.style.display = 'none';
                    this.callerAvatar.style.display = 'block';
                }
                this.localVideo.style.display = (this.callType === 'video') ? 'block' : 'none';
                this.toggleCameraBtn.style.display = (this.callType === 'video') ? 'flex' : 'none';

                break;
            case 'connecting':
                this.callStatusText.textContent = "Conectando...";
                break;
            case 'in-call':
                this.callStatusText.textContent = "00:00";
                 const hasBg = !!localStorage.getItem(`${this.currentUserId}CallBackground`);
                if (this.callType === 'video' && !hasBg) {
                    this.callerAvatar.style.display = 'none';
                } else {
                    this.remoteVideo.pause();
                    this.remoteVideo.style.display = 'none';
                    this.callerAvatar.style.display = 'block';
                }
                this.startCallTimer();
                break;
            case 'ended':
                this.callStatusText.textContent = "Chamada Encerrada";
                this.remoteVideo.pause();
                this.stopCallTimer();
                setTimeout(() => {
                    window.location.hash = '#/chat';
                }, 2000);
                break;
        }
    },

    startCallTimer() {
        this.callDuration = 0;
        this.callTimer = setInterval(() => {
            this.callDuration++;
            const minutes = String(Math.floor(this.callDuration / 60)).padStart(2, '0');
            const seconds = String(this.callDuration % 60).padStart(2, '0');
            this.callStatusText.textContent = `${minutes}:${seconds}`;
        }, 1000);
    },

    stopCallTimer() {
        clearInterval(this.callTimer);
    },

    toggleMic() {
        this.micOn = !this.micOn;
        this.toggleMicBtn.classList.toggle('active', !this.micOn);
        this.toggleMicBtn.querySelector('i').className = this.micOn ? 'fas fa-microphone' : 'fas fa-microphone-slash';
    },

    toggleCamera() {
        this.cameraOn = !this.cameraOn;
        this.toggleCameraBtn.classList.toggle('active', !this.cameraOn);
        this.toggleCameraBtn.querySelector('i').className = this.cameraOn ? 'fas fa-video' : 'fas fa-video-slash';
        this.localVideo.style.display = this.cameraOn ? 'block' : 'none';
    },

    handleBackgroundUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const imageUrl = e.target.result;
                this.customBackgroundImage.style.backgroundImage = `url('${imageUrl}')`;
                this.customBackgroundImage.style.display = 'block';
                this.customBackgroundImage.style.backgroundColor = 'transparent';
                this.remoteVideo.style.display = 'none';
                this.remoteVideo.pause();
                localStorage.setItem(`${this.currentUserId}CallBackground`, imageUrl);
            };
            reader.readAsDataURL(file);
        }
    }
};