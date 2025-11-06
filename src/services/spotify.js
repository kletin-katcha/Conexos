// src/services/spotify.js

const SPOTIFY_CLIENT_ID = '46d4eaa108544f34bcb303ab8ded6071';
const SPOTIFY_CLIENT_SECRET = 'f1620e6f6c914c7abaf50ae011b69363';

let spotifyAccessToken = '';

export const getSpotifyAccessToken = async () => {
    if (spotifyAccessToken) return spotifyAccessToken;

    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + btoa(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET)
        },
        body: 'grant_type=client_credentials'
    });
    const data = await response.json();
    spotifyAccessToken = data.access_token;
    return spotifyAccessToken;
};
