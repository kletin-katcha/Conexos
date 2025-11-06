// src/data/mock.js

export const mockUser = {
  name: 'Usuário Mock',
  avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
  bio: 'Desenvolvedor React e entusiasta de Tailwind CSS.',
  ownedGames: ['snake', 'pong'],
};

export const mockPosts = [
  { id: 1, type: 'text', author: 'Jules', avatar: 'https://i.pravatar.cc/150?u=jules', content: 'Acabei de refatorar toda a SPA Conexos para React. Que jornada!', likes: 120, comments: 15 },
  { id: 2, type: 'text', author: 'User', avatar: 'https://i.pravatar.cc/150?u=user', content: 'Alguém a fim de jogar uma partida de Pong?', likes: 25, comments: 5 },
];

export const mockCommunities = [
    { id: 'c1', name: 'React Developers', icon: 'fab fa-react', color: 'text-cyan-400', channels: [{ id: 'ch1', name: 'geral' }, { id: 'ch2', name: 'hooks-ajuda' }] },
    { id: 'c2', name: 'Cyberdeck Builders', icon: 'fas fa-terminal', color: 'text-lime-400', channels: [{ id: 'ch3', name: 'projetos' }, { id: 'ch4', name: 'inspiração' }] },
    { id: 'c3', name: 'Gamers de Plantão', icon: 'fas fa-headset', color: 'text-violet-400', channels: [{ id: 'ch5', name: 'lançamentos' }, { id: 'ch6', name: 'procurando-grupo' }] },
];

export const mockMessages = {
    'ch1': [
        { id: 'm1', user: 'Jules', avatar: 'https://i.pravatar.cc/150?u=jules', text: 'Bem-vindo ao canal geral de React!' },
        { id: 'm2', user: 'User', avatar: 'https://i.pravatar.cc/150?u=user', text: 'Oi pessoal! Alguém pode me ajudar com o useEffect?' },
    ],
    'ch2': [ { id: 'm3', user: 'Jules', avatar: 'https://i.pravatar.cc/150?u=jules', text: 'Poste seu código aqui que a gente ajuda.' } ],
    'dm1': [
        { id: 'dm1-m1', user: 'Jules', avatar: 'https://i.pravatar.cc/150?u=jules', text: 'E aí, tudo certo?' },
        { id: 'dm1-m2', user: 'User', avatar: 'https://i.pravatar.cc/150?u=user', text: 'Tudo ótimo! E com você?' },
    ]
};

export const mockUsers = [
    {id: 'u1', name: 'Jules', avatar: 'https://i.pravatar.cc/150?u=jules'},
    {id: 'u2', name: 'User', avatar: 'https://i.pravatar.cc/150?u=user'},
    {id: 'u3', name: 'Dev', avatar: 'https://i.pravatar.cc/150?u=dev'},
];

export const mockGames = [
    { id: 'snake', name: 'Snake', image: 'https://via.placeholder.com/300x200.png/1a1a1a/lime?text=Snake', price: 'Grátis', src: '/assets/Jogos/snake.html' },
    { id: 'pong', name: 'Pong', image: 'https://via.placeholder.com/300x200.png/1a1a1a/cyan?text=Pong', price: 'R$ 5,00', src: '/assets/Jogos/pong.html' },
    { id: 'pao', name: 'Pão na Chapa', image: 'https://via.placeholder.com/300x200.png/1a1a1a/amber?text=Pão', price: 'R$ 10,00', src: '/assets/Jogos/pao.html' },
];

export const mockNotifications = [
    { id: 1, text: 'Jules curtiu sua publicação.', time: 'há 5 minutos' },
    { id: 2, text: 'Você tem uma nova mensagem de User.', time: 'há 1 hora' },
    { id: 3, text: 'A comunidade Cyberdeck Builders tem um novo post.', time: 'há 3 horas' },
];
