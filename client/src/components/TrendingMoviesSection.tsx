import { Film } from "lucide-react";
import type { Movie } from "../redux/movie/movieApi.ts";
import EmptyState from "./EmptyState.tsx";
import { MovieGridSkeleton } from "./skeletons";
import MovieCardsView from "./MovieCardsView.tsx";

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
            <MovieGridSkeleton
                count={15}
                gridCols="grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
                gap="gap-6"
            />
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
    const movieEntries = trendingData.results.map((movie) => ({
        id: movie.id.toString(),
        movieId: movie.id,
        // Pass the movie data directly to avoid extra fetching
        movieData: movie,
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
                // For trending, we don't use MyListMovieCard, we use the simple Movie data
                useSimpleMovieCard={true}
            />
        </div>
    );
};

export default TrendingMoviesSection;