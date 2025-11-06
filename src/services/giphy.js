// src/services/giphy.js

const GIPHY_API_KEY = 'cRPAFfmgRPGqxeWQVNowBepFDfqfifPK';

export const fetchGifs = async (query) => {
    const url = query.trim()
        ? `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${query}&limit=20`
        : `https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_API_KEY}&limit=20`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        return data.data;
    } catch (error) {
        console.error("Failed to fetch GIFs", error);
        return [];
    }
};
