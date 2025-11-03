import {Injectable} from "@nestjs/common";

@Injectable()
export class MovieService {

    async getTrending() {

        try {
            const url = 'https://api.themoviedb.org/3/trending/movie/day?language=en-US';
            const options = {
                method: 'GET',
                headers: {
                    accept: 'application/json',
                    Authorization: 'Bearer '+ process.env.TMDB_ACCESS_TOKEN,
                }
            };

            const res = await fetch(url, options)
            const data = await res.json();
            console.log("DATA FROM TMDB ", data);
            return data;
        }
        catch(err) {
            console.error('Error FROM TMBD:', err);
            return null;
        }

    }


    async getMovies(query: string) {

        try {

            const url = `https://api.themoviedb.org/3/search/movie?query=${query}&include_adult=true&language=en-US&page=1`;

            const options = {
                method: 'GET',
                headers: {
                    accept: 'application/json',
                    Authorization: 'Bearer '+ process.env.TMDB_ACCESS_TOKEN,
                }
            };


            const res = await fetch(url, options)
            const data = await res.json();
            console.log("DATA FROM TMDB ", data);
            return data;

        } catch (e) {
            console.error('Error constructing URL:', e);
            return null;
        }


    }
}
