//
// // url.concat(`&query=${query}&api_key=${process.env.TMDB_API_KEY}`);
//
// const url = 'https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc';
// const options = {
//     method: 'GET',
//     headers: {
//         accept: 'application/json',
//         Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1MDRiMGU2ODc2OTFhZTJiMTU1YTliNDQzNDFmOWIyMiIsIm5iZiI6MTc2MjE3NzY5Ni4xNzUsInN1YiI6IjY5MDhiMmEwODFlMzRlNjViYWUxMzQ5NyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.hbrUKMn6sgynZX5NrLp8IRqUbb2YjBCeZkJi0n_fobk'
//     }
// };
//
//
// const res = await fetch(url, options)
// const data = await res.json();
// console.log("DATA FROM TMDB ", data);
// return data;
//
