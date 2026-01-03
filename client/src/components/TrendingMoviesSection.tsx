import { Film } from "lucide-react";
import type { Movie } from "../redux/movie/movieApi.ts";
import EmptyState from "./EmptyState.tsx";
import { MovieCardSkeleton } from "./skeletons";
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
    if (isTrendingLoading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                <MovieCardSkeleton count={15} />
            </div>
        );
    }

    if (isTrendingError) {
        return (
            <div className="text-center py-20">
                <p className="text-red-500">Failed to load trending movies. Please try again later.</p>
            </div>
        );
    }

    if (!trendingData?.results || trendingData.results.length === 0) {
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
    const movieEntries: MovieEntry[] = trendingData.results.map((movie) => ({
        id: movie.id.toString(),
        movieId: movie.id,
        movieData: movie,
        status: null,
        isFavorite: false,
    }));

    return (
        <div className="max-w-6xl mx-auto">
            <MovieCardsView
                movies={movieEntries}
                isLoading={false}
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