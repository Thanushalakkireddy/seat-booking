import { useState, useEffect } from "react";
import axios from "axios";

function MovieCard({ movie }) {
  return (
    <div className="max-w-sm rounded overflow-hidden shadow-lg m-4 bg-white">
      <img
        className="w-full h-48 object-cover"
        src={movie.bannerUrl}
        alt={movie.title}
      />
      <div className="px-6 py-4">
        <div className="font-bold text-xl mb-2">
          {movie.title} ({movie.year})
        </div>
        <p className="text-gray-700 text-base">{movie.desc}</p>
      </div>
      <div className="px-6 pt-4 pb-2 flex space-x-2">
        <a
          href={movie.url}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Watch Trailer
        </a>
        <a
          href={`/seats/${movie.id}`}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Book Now
        </a>
      </div>
    </div>
  );
}

export default function ViewMovies() {
  const [movies, setMovies] = useState([]);
  const [allGenres, setAllGenres] = useState([]);
  const [message, setMessage] = useState("");
  const [genre, setGenre] = useState("All");

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        // Fetch movies from user endpoint
        const response = await axios.get(
          "https://seat-booking-yfc8.onrender.com/api/user/viewAllMovies"
        );

        console.log("Fetched movies:", response.data);
        
        // Handle different response formats
        if (Array.isArray(response.data)) {
          setMovies(response.data);
        } else if (response.data && Array.isArray(response.data.data)) {
          setMovies(response.data.data);
        } else {
          setMovies([]);
        }
      } catch (err) {
        setMessage(err.message);
      }
    };
    
    const fetchGenres = async () => {
      try {
        const response = await axios.get(
          "https://seat-booking-yfc8.onrender.com/api/user/viewAllGenre"
        );
        
        console.log("Fetched genres:", response.data);
        
        if (Array.isArray(response.data)) {
          setAllGenres(response.data);
        } else if (response.data && Array.isArray(response.data.data)) {
          setAllGenres(response.data.data);
        } else {
          setAllGenres([]);
        }
      } catch (err) {
        console.error('Error fetching genres:', err.message);
      }
    };
    
    fetchMovies();
    fetchGenres();
  }, [message]);

  // ✅ Apply filtering based on selected genre
  const filteredMovies = genre === "All"
    ? movies
    : movies.filter((movie) => movie.genre?.name === genre);


  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Movies</h2>
      {message && <p className="text-red-500 mb-4">{message}</p>}

      {/* Genre filter dropdown */}
      <div className="mb-6">
        <label className="text-gray-700 font-semibold mr-2">Filter by Genre:</label>
        <select
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          className="px-3 py-2 rounded-md bg-gray-800 text-white"
        >
          <option value="All">All</option>
          {allGenres.map((g) => (
            <option key={g.id} value={g.name}>{g.name}</option>
          ))}
        </select>
      </div>

      {/* Movies grid */}
      <div className="flex flex-wrap">
        {filteredMovies.length > 0 ? (
          filteredMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))
        ) : (
          <p className="text-gray-500">No movies found for this genre.</p>
        )}
      </div>
    </div>
  );
}