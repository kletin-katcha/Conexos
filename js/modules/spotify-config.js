// ATENÇÃO: Este é um arquivo de configuração.
// Cole aqui as suas credenciais obtidas no Dashboard de Desenvolvedor do Spotify.

// 1. O seu Client ID (corrigido)
const clientId = "46d4eaa108544f34bcb303ab8ded6071"; 

// 2. Cole o seu Client Secret aqui
const clientSecret = "f1620e6f6c914c7abaf50ae011b69363";


// --- Lógica para obter o Token de Acesso ---
// O Spotify usa esse token para saber que é a sua aplicação que está fazendo a chamada.
// Este token expira a cada 1 hora, então precisamos de uma função para pegá-lo sempre que necessário.

let accessToken = '';
let tokenExpirationTime = 0;

export async function getAccessToken() {
    // Se já temos um token e ele ainda não expirou, usamos o mesmo.
    if (accessToken && Date.now() < tokenExpirationTime) {
        return accessToken;
    }

    // Se não, pedimos um novo token para a API do Spotify.
    console.log("Solicitando novo token de acesso do Spotify...");

    const result = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
        },
        body: 'grant_type=client_credentials'
    });

    if (!result.ok) {
        console.error("Falha ao obter o token de acesso do Spotify.");
        return null;
    }

    const data = await result.json();
    accessToken = data.access_token;
    // Guardamos o tempo de expiração (convertido para milissegundos)
    tokenExpirationTime = Date.now() + data.expires_in * 1000;
    
    console.log("Novo token de acesso obtido!");
    return accessToken;
}
