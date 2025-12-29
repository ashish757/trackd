import { CustomLoggerService } from "@app/common";

const logger = new CustomLoggerService();
logger.setContext('TmdbConfig');

export const baseUrl = 'https://api.themoviedb.org/3/';

export const getOptions = () => {
    return {
        method: "GET",
        headers: {
            accept: 'application/json',
            Authorization: 'Bearer '+ process.env.TMDB_ACCESS_TOKEN,
        }
    }
};


export const fetchFromTmdb = async (endpoint: string) => {
    try {
        const url = baseUrl + endpoint;
        const options = getOptions();

        const res = await fetch(url, options)
        const data = await res.json();
        return {error: false, data};
    }
    catch(err) {
        logger.error('Error from TMDB:', err);
        return {error: true};
    }
}