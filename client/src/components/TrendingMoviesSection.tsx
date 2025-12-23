import { Film } from "lucide-react";
import type { Movie } from "../redux/movie/movieApi.ts";
import MovieCard from "./MovieCard.tsx";
import EmptyState from "./EmptyState.tsx";

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
                    {trendingData.results.map((movie) => (
                        <MovieCard
                            key={movie.id}
                            movie={movie}
                            onClick={handleSuggestionClick}
                        />
                    ))}
                </div>
            ) : (
                <EmptyState
                    icon={Film}
                    title="No trending movies"
                    description="No trending movies available at the moment."
                    size="medium"
                />
            )}
        </div>
    );
};

export default TrendingMoviesSection;