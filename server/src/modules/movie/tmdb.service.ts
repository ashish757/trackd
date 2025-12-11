import {HttpException, Injectable, InternalServerErrorException} from '@nestjs/common';

@Injectable()
export class TmdbService {
    private readonly baseUrl = 'https://api.themoviedb.org/3';
    private readonly apiKey = process.env.TMDB_API_KEY;

    options = () => {
        return {
            method: "GET",
            headers: {
                accept: 'application/json',
                Authorization: 'Bearer '+ process.env.TMDB_ACCESS_TOKEN,
            }
        }
    };


    async fetch(endpoint: string) {
        console.log("fetching ", endpoint);

        const url = this.baseUrl + endpoint;
        const options = this.options();

        try {
            const res = await fetch(url, options);

            if (!res.ok) {
                const errorText = await res.text();

                throw new HttpException(
                    `TMDB API failed: ${res.statusText} - ${errorText.substring(0, 100)}`,
                    res.status
                );
            }

            return await res.json();

        } catch (err) {
            if (err instanceof HttpException) {
                throw err;
            }
            console.error('TMDB Network/Connection Error:', err);
            throw new InternalServerErrorException('Could not connect to external TMDB service.');
        }
    }

    async getLocalizedTrending(region: string, page = 1) {
        const regionParam = region ? region.toUpperCase() : 'US';

        const params = new URLSearchParams({
            api_key: this.apiKey,
            region: regionParam, // Controls the LIST content (Popularity in specific country)
            page: page.toString(),
            include_adult: 'true',
        });
        const url = `/movie/popular?${params.toString()}`;

        return await this.fetch(url)
    }


    async searchLocalised(
        query: string,
        region: string,
        page: number = 1
    ) {
        const regionParam = region ? region.toUpperCase() : 'US';

        // Map region to language code for better localization
        const languageMap: Record<string, string> = {
            'US': 'en-US',
            'GB': 'en-GB',
            'IN': 'en-IN',
            'DE': 'de-DE',
            'FR': 'fr-FR',
            'ES': 'es-ES',
            'IT': 'it-IT',
            'JP': 'ja-JP',
            'KR': 'ko-KR',
            'BR': 'pt-BR',
        };
        const language = languageMap[regionParam] || 'en-US';

        const params = new URLSearchParams({
            api_key: this.apiKey,
            query: query,
            page: page.toString(),
            include_adult: 'false',
            region: regionParam,
        });

        // const url = `/search/movie?${params.toString()}`;

        const url = `/search/movie?query=${encodeURIComponent(query)}&include_adult=true&language=en-US&page=1`

        const data = await this.fetch(url);

        return data;
    }

}