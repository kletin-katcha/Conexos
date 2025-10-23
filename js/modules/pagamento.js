// =================================
//  MÓDULO DE LÓGICA DA PÁGINA DE PAGAMENTO (REMAKE COM VANILLA JS)
// =================================
import { storeGamesData } from './gamedata.js'; // Importa dados do arquivo central

export const Pagamento = {
    ownedGames: [],
    cardNumberMask: null,
    // Máscaras para os diferentes tipos de cartão
    amexCardMask: '0000 000000 00000',
    otherCardMask: '0000 0000 0000 0000',

    init() {
        if (!document.querySelector('.content-payment')) return;
        this.cacheDOMElements();
        this.loadOwnedGames();
        this.addEventListeners();
        this.initPaymentForm();
        this.populateSummary();
        this.loadCardBackground(); // NOVO
    },

    cacheDOMElements() {
        // Resumo
        this.gameImage = document.getElementById('game-image');
        this.gameName = document.getElementById('game-name');
        this.gamePrice = document.getElementById('game-price');
        this.summaryPrice = document.getElementById('summary-price');
        this.totalPrice = document.getElementById('total-price');
        
        // Formulário e Cartão
        this.paymentForm = document.getElementById('payment-form');
        this.interactiveCard = document.getElementById('interactive-card');
        this.cardTypeImg = document.getElementById('card-type-img');
        this.cardTypeImgBack = document.getElementById('card-type-img-back');
        this.cardNumberDisplay = document.getElementById('card-number-display');
        this.cardNameDisplay = document.getElementById('card-name-display');
        this.cardExpiryDisplay = document.getElementById('card-expiry-display');
        this.cardCvcDisplay = document.getElementById('card-cvc-display');
        this.cardNumberInput = document.getElementById('card-number-input');
        this.cardNameInput = document.getElementById('card-name-input');
        this.cardExpiryInput = document.getElementById('card-expiry-input');
        this.cardCvcInput = document.getElementById('card-cvc-input');

        // NOVO: Elementos para background do cartão
        this.changeCardBgBtn = document.getElementById('change-card-bg-btn');
        this.cardBgInput = document.getElementById('card-bg-input');
        this.cardBgFront = document.getElementById('card-bg-front');
        this.cardBgBack = document.getElementById('card-bg-back');

        // Toast
        this.toastMessage = document.getElementById('toast-message');
    },

    addEventListeners() {
        this.paymentForm.addEventListener('submit', (e) => this.handlePayment(e));
        
        // Listeners para o cartão interativo
        this.cardNumberInput.addEventListener('input', () => this.updateCardDisplay());
        this.cardNameInput.addEventListener('input', () => this.updateCardDisplay());
        this.cardExpiryInput.addEventListener('input', () => this.updateCardDisplay());
        this.cardCvcInput.addEventListener('input', () => this.updateCardDisplay());

        this.cardCvcInput.addEventListener('focus', () => this.flipCard(true));
        this.cardCvcInput.addEventListener('blur', () => this.flipCard(false));

        // NOVO: Eventos para o background do cartão
        this.changeCardBgBtn.addEventListener('click', () => this.cardBgInput.click());
        this.cardBgInput.addEventListener('change', (e) => this.handleBackgroundUpload(e));
    },

    populateSummary() {
        const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
        const gameId = urlParams.get('gameId');
        if (!gameId) {
            console.error("Game ID não encontrado na URL");
            this.gameName.textContent = "Erro";
            this.gamePrice.textContent = "Jogo não encontrado";
            return;
        }

        const game = storeGamesData.find(g => g.id === gameId);
        if (game) {
            this.gameImage.src = game.image;
            this.gameName.textContent = game.title;
            this.gamePrice.textContent = game.price;
            this.summaryPrice.textContent = game.price;
            this.totalPrice.textContent = game.price;
            this.paymentForm.querySelector('button[type="submit"]').textContent = `Pagar ${game.price}`;
        } else {
             console.error("Jogo não encontrado:", gameId);
             this.gameName.textContent = "Erro";
             this.gamePrice.textContent = "Jogo não encontrado";
        }
    },
    
    handlePayment(event) {
        event.preventDefault();
        const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
        const gameId = urlParams.get('gameId');
        const game = storeGamesData.find(g => g.id === gameId);

        if (game) {
            this.ownedGames.push(gameId);
            this.saveOwnedGames();
            this.showToast(`${game.title} foi adicionado à sua biblioteca!`);
            
            this.paymentForm.querySelector('button[type="submit"]').disabled = true;
            this.paymentForm.querySelector('button[type="submit"]').textContent = "Processando...";
            
            setTimeout(() => {
                window.location.hash = '#/game';
            }, 2500);
        }
    },
    
    loadOwnedGames() {
        const saved = sessionStorage.getItem('ownedGames');
        this.ownedGames = saved ? JSON.parse(saved) : [];
    },

    saveOwnedGames() {
        sessionStorage.setItem('ownedGames', JSON.stringify(this.ownedGames));
    },

    showToast(message) {
        this.toastMessage.textContent = message;
        this.toastMessage.classList.add('show');
        setTimeout(() => {
            this.toastMessage.classList.remove('show');
        }, 3000);
    },

    initPaymentForm() {
        // Inicia com a máscara padrão, que será atualizada dinamicamente
        this.cardNumberMask = IMask(this.cardNumberInput, { mask: this.otherCardMask });
        IMask(this.cardExpiryInput, { mask: '00/00' });
        IMask(this.cardCvcInput, { mask: '0000' });
        this.updateCardDisplay();
    },

    // LÓGICA DO NÚMERO DO CARTÃO CORRIGIDA
    animateCardNumber() {
        const display = this.cardNumberDisplay;
        const placeholder = this.cardNumberMask.mask.replace(/0/g, '#');
        const formattedValue = this.cardNumberMask.masked.value;

        // Limpa o display e recria os spans
        display.innerHTML = '';
        for (let i = 0; i < placeholder.length; i++) {
            const span = document.createElement('span');
            let char = formattedValue[i] || placeholder[i];
            span.textContent = char;
            display.appendChild(span);
        }
    },

    updateCardDisplay() {
        // Nome e Validade
        const cardName = this.cardNameInput.value.toUpperCase() || "NOME COMPLETO";
        const expiry = this.cardExpiryInput.value || "MM/YY";
        const [month, year] = expiry.split('/');
        
        this.cardNameDisplay.textContent = cardName;
        this.cardExpiryDisplay.children[0].textContent = month || 'MM';
        this.cardExpiryDisplay.children[1].textContent = year || 'YY';
        
        // CVC
        const cvc = this.cardCvcInput.value;
        this.cardCvcDisplay.textContent = ''.padStart(cvc.length, '*');
        
        // Bandeira do Cartão e Máscara Dinâmica
        const cardNumberRaw = this.cardNumberInput.value.replace(/\s/g, '');
        const cardType = this.detectCardType(cardNumberRaw);
        
        const newMask = cardType === 'amex' ? this.amexCardMask : this.otherCardMask;
        if (this.cardNumberMask && this.cardNumberMask.mask !== newMask) {
            this.cardNumberMask.updateOptions({ mask: newMask });
        }
        
        const cardTypeImgUrl = cardType ? `https://i.imgur.com/${this.getCardImageName(cardType)}.png` : '';
        this.cardTypeImg.src = cardTypeImgUrl;
        this.cardTypeImgBack.src = cardTypeImgUrl;
        this.cardTypeImg.style.opacity = cardType ? '1' : '0';
        
        // Número do Cartão com Animação (Corrigido)
        this.animateCardNumber();
    },
    
    getCardImageName(type) {
        const map = { visa: '2FzU0y6', mastercard: 'VI0Vp5M', amex: 'W11T12x' };
        return map[type] || '';
    },

    // Função de detecção de bandeira aprimorada
    detectCardType(number) {
        let re = new RegExp("^4");
        if (number.match(re) != null) return "visa";

        re = new RegExp("^(34|37)");
        if (number.match(re) != null) return "amex";

        re = new RegExp("^5[1-5]");
        if (number.match(re) != null) return "mastercard";

        re = new RegExp("^6011");
        if (number.match(re) != null) return "discover";
        
        re = new RegExp('^9792');
        if (number.match(re) != null) return 'troy';

        return null; // Retorna nulo se nenhuma bandeira for identificada
    },

    flipCard(isFlipped) {
        this.interactiveCard.classList.toggle('-active', isFlipped);
    },

    // --- NOVO: Lógica para Background do Cartão ---
    handleBackgroundUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const imageUrl = e.target.result;
                this.setCardBackground(imageUrl);
                sessionStorage.setItem('customCardBg', imageUrl); // Salva na sessão
            };
            reader.readAsDataURL(file);
        }
    },

    setCardBackground(imageUrl) {
        this.cardBgFront.src = imageUrl;
        this.cardBgBack.src = imageUrl;
    },

    loadCardBackground() {
        const savedBg = sessionStorage.getItem('customCardBg');
        if (savedBg) {
            this.setCardBackground(savedBg);
        }
    }
};