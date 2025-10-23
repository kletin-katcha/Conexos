// =================================
//  MÓDULO CENTRAL DE DADOS DE JOGOS
//  Fonte única de dados para Game, Pagamento e Profile.
// =================================

export const storeGamesData = [
    { 
        id: 'store1', 
        title: 'Grand Theft Auto VI', 
        description: 'Explore o estado de Leonida, lar das ruas encharcadas de neon de Vice City, na maior e mais imersiva evolução da série Grand Theft Auto.', 
        image: 'https://cdn.mos.cms.futurecdn.net/25ttg5Qp7Mcr5sSMyGfS4A-970-80.jpg.webp',
        price: 'R$ 349,90', 
        isFree: false 
    },
    { 
        id: 'store2', 
        title: 'Elden Ring: Shadow of the Erdtree', 
        description: 'Viaje para a Terra das Sombras e explore um novo capítulo da obra-prima da FromSoftware. Uma expansão massiva aguarda.', 
        image: 'https://cdn.akamai.steamstatic.com/steam/apps/2778580/capsule_616x353.jpg?t=1708533808',
        price: 'R$ 199,90', 
        isFree: false 
    },
    { 
        id: 'store3', 
        title: 'Hades II', 
        description: 'Lute além do Submundo usando magia sombria para desafiar o Titã do Tempo nesta sequência do aclamado roguelike.',
        image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1145350/capsule_616x353.jpg?t=1715022933',
        price: 'R$ 88,99', 
        isFree: false
    },
    { 
        id: 'store4', 
        title: 'Counter-Strike 2', 
        description: 'O próximo capítulo de um dos maiores jogos de FPS competitivos de todos os tempos, agora na engine Source 2 com gráficos e jogabilidade aprimorados.',
        image: 'https://cdn.akamai.steamstatic.com/steam/apps/730/capsule_616x353.jpg?t=1695155293',
        price: 'Gratuito', 
        isFree: true
    },
];

export const newsData = [
    { 
        id: 'news1', 
        title: 'Trailer de GTA 6 Quebra a Internet e Confirma Lançamento para 2025', 
        snippet: 'A Rockstar Games finally revealed the first trailer for Grand Theft Auto VI, confirming the setting in Vice City and a new female protagonist. The game is expected to be one of the biggest releases of the decade, pushing the limits of new generation hardware.', 
        image: 'https://cdn.mos.cms.futurecdn.net/25ttg5Qp7Mcr5sSMyGfS4A-970-80.jpg.webp',
        source: 'IGN Brasil',
        publishedAt: '05 de Dez, 2023',
        url: 'https://br.ign.com/gta-6/117290/news/gta-6-assista-ao-primeiro-trailer-oficial'
    },
    { 
        id: 'news2', 
        title: 'Elden Ring: Shadow of the Erdtree Promete Ser a Maior Expansão da FromSoftware', 
        snippet: 'A tão aguardada DLC de Elden Ring, Shadow of the Erdtree, ganhou data de lançamento e um trailer que revela um mapa totalmente novo e chefes aterrorizantes. A expansão chegará em junho de 2024, prometendo dezenas de horas de novo conteúdo para os fãs.', 
        image: 'https://cdn.akamai.steamstatic.com/steam/apps/2778580/capsule_616x353.jpg?t=1708533808',
        source: 'The Enemy',
        publishedAt: '21 de Fev, 2024',
        url: 'https://www.theenemy.com.br/elden-ring/elden-ring-shadow-of-the-erdtree-ganha-trailer-e-data-de-lancamento'
    },
    { 
        id: 'news3', 
        title: 'Hades II Chega de Surpresa em Acesso Antecipado na Steam', 
        snippet: 'A Supergiant Games surpreendeu a todos lançando Hades II em Acesso Antecipado, permitindo que os jogadores explorem o submundo com uma nova protagonista, Melinoë, a Princesa do Submundo. A versão inicial já conta com mais conteúdo que o jogo original completo.',
        image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1145350/capsule_616x353.jpg?t=1715022933',
        source: 'The Verge',
        publishedAt: '06 de Mai, 2024',
        url: 'https://www.theverge.com/2024/5/6/24150220/hades-2-early-access-release-steam-epic-games-store'
    },
];

export const onlineGamesData = [
    { id: 'snake-game', title: 'Cobra Retrô', description: 'O clássico atemporal. Cresça e evite as paredes!', image: 'https://placehold.co/400x225/22c55e/080808?text=Snake', gameUrl: 'assets/Jogos/snake.html' },
    { id: 'rabbit-runner', title: 'Rabbit Runner', description: 'Corra, pule e desvie neste corredor infinito 3D.', image: 'https://placehold.co/400x225/ef4444/ffffff?text=Rabbit', gameUrl: 'assets/Jogos/catch-the-rabbit.html' },
    { id: 'toast-catcher', title: 'Pega Torrada', description: 'Agilidade é tudo para pegar as torradas voadoras!', image: 'https://placehold.co/400x225/f59e0b/000000?text=Toast', gameUrl: 'assets/Jogos/pao.html' },
    { id: 'pong', title: 'Pong Clássico', description: 'O lendário jogo de arcade que deu início a tudo.', image: 'https://placehold.co/400x225/3b82f6/ffffff?text=Pong', gameUrl: 'assets/Jogos/pong.html' },
    { id: 'escape-road', title: 'Escape Road', description: 'Desvie dos obstáculos e chegue o mais longe que puder.', image: 'https://placehold.co/400x225/9333ea/ffffff?text=Escape', gameUrl: 'assets/Jogos/escape-road.html' },
];