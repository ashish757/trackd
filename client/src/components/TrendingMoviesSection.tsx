import { Film, TrendingUp } from "lucide-react";
import type { Movie } from "../redux/movie/movieApi.ts";
import MovieCard from "./MovieCard.tsx";

interface MovieInfo {
    isTrendingLoading: boolean;
    isTrendingError?: boolean;

    trendingData: {
        results: Array<Movie>;
    } | undefined;

    handleSuggestionClick: (movie: Movie) => void;
}

const TrendingMoviesSection = ({ isTrendingLoading, trendingData, isTrendingError, handleSuggestionClick }: MovieInfo) => {
    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">Trending Today</h2>
            </div>

            {isTrendingLoading ? (
                <div className="flex justify-center items-center py-20">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                </div>
            ) : isTrendingError ? (
                <div className="text-center py-20">
                    <p className="text-red-500">Failed to load trending movies. Please try again later.</p>
                </div>
            ) : trendingData?.results && trendingData.results.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {trendingData.results.slice(0, 10).map((movie) => (
                        <MovieCard
                            key={movie.id}
                            movie={movie}
                            onClick={handleSuggestionClick}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20">
                    <Film className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500">No trending movies available at the moment.</p>
                </div>
            )}
        </div>
    );
};

export default TrendingMoviesSection;