export const Login = {
    init() {
        // Adiciona a classe de estilização da página de autenticação ao body
        document.body.classList.add('auth-page');

        const toggleLogin = document.getElementById('toggle-login');
        const toggleRegister = document.getElementById('toggle-register');
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        const statusText = document.getElementById('status-text');
        const allForms = [loginForm, registerForm];

        toggleLogin.addEventListener('click', () => {
            document.querySelector('.form-toggle').classList.remove('register-active');
            loginForm.classList.remove('hidden');
            registerForm.classList.add('hidden');
            if (statusText) statusText.textContent = '';
        });

        toggleRegister.addEventListener('click', () => {
            document.querySelector('.form-toggle').classList.add('register-active');
            registerForm.classList.remove('hidden');
            loginForm.classList.add('hidden');
            if (statusText) statusText.textContent = '';
        });

        // Simulação de autenticação
        allForms.forEach(form => {
            if (!form) return;
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const isLoginForm = form.id === 'login-form';
                const action = isLoginForm ? 'Conectando' : 'Registrando';
                
                if (statusText) statusText.textContent = `${action}...`;
                
                const submitButton = form.querySelector('.btn-submit');
                if(submitButton) {
                    submitButton.disabled = true;
                    submitButton.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i>`;
                }

                // *** NOVA LÓGICA DICEBEAR ***
                // Se for um novo registro, gera e salva um avatar padrão.
                if (!isLoginForm) {
                    const registerUser = document.getElementById('register-user').value.trim();
                    if (registerUser) {
                        const avatarUrl = `https://api.dicebear.com/8.x/pixel-art/svg?seed=${encodeURIComponent(registerUser)}`;
                        sessionStorage.setItem('profilePicURL', avatarUrl);
                        sessionStorage.setItem('profileName', registerUser);
                    }
                }

                // Simula um tempo de carregamento da rede
                setTimeout(() => {
                    sessionStorage.setItem('isLoggedIn', 'true');
                    window.location.hash = '#/feed'; // Redireciona para o feed
                }, 1500);
            });
        });

        this.startGalaxyAnimation();
    },

    startGalaxyAnimation() {
        const canvas = document.getElementById('galaxy-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let stars = [];
        let shootingStars = []; // Array para as estrelas cadentes
        let animationFrameId;

        const setCanvasSize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        // Objeto para uma estrela estática (fundo)
        function Star() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.radius = Math.random() * 1.2 + 0.5;
            this.vx = (Math.random() - 0.5) * 0.15;
            this.vy = (Math.random() - 0.5) * 0.15;
            this.opacity = Math.random() * 0.5 + 0.3;
        }
        
        // --- NOVO: Objeto para uma estrela cadente ---
        function ShootingStar() {
            // Reseta a posição e propriedades da estrela cadente
            this.reset = function() {
                this.x = Math.random() * canvas.width;
                this.y = 0; // Começa no topo
                this.len = (Math.random() * 80) + 10;
                this.speed = (Math.random() * 10) + 6;
                this.size = (Math.random() * 1) + 0.1;
                // Ângulo para dar a impressão de queda diagonal
                this.angle = Math.PI / 4; 
            };

            // Atualiza a posição
            this.update = function() {
                this.x += this.speed;
                this.y += this.speed;
                // Se sair da tela, reseta
                if (this.x > canvas.width + this.len || this.y > canvas.height + this.len) {
                    this.reset();
                }
            };
            
            // Desenha a estrela com uma cauda em gradiente
            this.draw = function() {
                ctx.beginPath();
                const grad = ctx.createLinearGradient(this.x, this.y, this.x - this.len, this.y - this.len);
                grad.addColorStop(0, "rgba(255, 255, 255, 0.4)");
                grad.addColorStop(1, "rgba(255, 255, 255, 0)");

                ctx.strokeStyle = grad;
                ctx.lineWidth = this.size;
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(this.x - this.len, this.y - this.len);
                ctx.stroke();
            };

            this.reset();
        }

        const createField = () => {
            stars = [];
            shootingStars = [];
            const starCount = Math.floor((canvas.width * canvas.height) / 3000); 
            for (let i = 0; i < starCount; i++) {
                stars.push(new Star());
            }
            // Criamos apenas algumas estrelas cadentes para o efeito minimalista
            for (let i = 0; i < 3; i++) {
                shootingStars.push(new ShootingStar());
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Anima estrelas estáticas de fundo
            stars.forEach(star => {
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(224, 226, 231, ${star.opacity})`;
                ctx.fill();
                star.x += star.vx;
                star.y += star.vy;
                if (star.x < 0 || star.x > canvas.width) star.vx = -star.vx;
                if (star.y < 0 || star.y > canvas.height) star.vy = -star.vy;
            });
            
            // Anima as novas estrelas cadentes
            shootingStars.forEach(star => {
                star.update();
                star.draw();
            });

            animationFrameId = requestAnimationFrame(animate);
        };
        
        const resizeHandler = () => {
            setCanvasSize();
            createField();
        };

        window.addEventListener('resize', resizeHandler);

        this.cleanupAnimation = () => {
            window.removeEventListener('resize', resizeHandler);
            cancelAnimationFrame(animationFrameId);
        };

        setCanvasSize();
        createField();
        animate();
    },
    
    cleanup() {
        // Remove a classe de estilização e para a animação ao sair da página de login
        document.body.classList.remove('auth-page');
        if (this.cleanupAnimation) {
            this.cleanupAnimation();
        }
    }
};