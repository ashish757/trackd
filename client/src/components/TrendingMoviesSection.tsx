import { Film } from "lucide-react";
import type { Movie } from "../redux/movie/movieApi.ts";
import EmptyState from "./EmptyState.tsx";
import MovieCardsView from "./movieCards/MovieCardsView.tsx";
import type { MovieEntry } from "../types/movie.types";

interface MovieInfo {
    isTrendingLoading: boolean;
    isTrendingError?: boolean;
    trendingData: {
        results: Array<Movie>;
    } | undefined;
    handleSuggestionClick: (movie: Movie) => void;
}

const TrendingMoviesSection = ({ isTrendingLoading, trendingData, isTrendingError, handleSuggestionClick }: MovieInfo) => {

    if (isTrendingError) {
        return (
            <div className="text-center py-20">
                <p className="text-red-500">Failed to load trending movies. Please try again later.</p>
            </div>
        );
    }

    // Show empty state only when NOT loading and no results
    if (!isTrendingLoading && (!trendingData?.results || trendingData.results.length === 0)) {
        return (
            <EmptyState
                icon={Film}
                title="No trending movies"
                description="No trending movies available at the moment."
                size="medium"
            />
        );
    }

    // Transform Movie[] to MovieEntry[] format expected by MovieCardsView
    // Handle loading state - provide empty array while loading
    const movieEntries: MovieEntry[] = trendingData?.results
        ? trendingData.results.map((movie) => ({
            id: movie.id.toString(),
            movieId: movie.id,
            movieData: movie,
            status: null,
            isFavorite: false,
        }))
        : [];

    return (
        <div className="max-w-6xl mx-auto">
            <MovieCardsView
                movies={movieEntries}
                isLoading={isTrendingLoading}
                onMovieClick={handleSuggestionClick}
                emptyStateMessage="No trending movies available at the moment."
                showViewToggle={true}
                defaultView="grid"
                viewModeStorageKey="trending_view_mode"
                useSimpleMovieCard={true}

            />
        </div>
    );
};

export default TrendingMoviesSection;