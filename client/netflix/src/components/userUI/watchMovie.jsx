import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

export default function WatchMovie() {
    const { id } = useParams();
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMovie = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:8060/api/user/viewMovie/${id}`
                );
                
                if (response.data) {
                    setMovie(response.data);
                    setLoading(false);
                }
            } catch (err) {
                setError(err.message);
                setLoading(false);
                console.error('Error fetching movie:', err);
            }
        };
        
        if (id) {
            fetchMovie();
        }
    }, [id]);

    if (loading) {
        return <div className="p-4 text-center">Loading movie...</div>;
    }
    
    if (error) {
        return <div className="p-4 text-center text-red-500">Error loading movie: {error}</div>;
    }
    
    if (!movie) {
        return <div className="p-4 text-center">Movie not found</div>;
    }

    return(
        <div className="p-4 max-w-4xl mx-auto">
            <div className="bg-gray-900 text-white p-6 rounded-lg">
                <h1 className="text-3xl font-bold mb-4">{movie.title} ({movie.year})</h1>
                
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="md:w-1/3">
                        <img 
                            src={movie.bannerUrl} 
                            alt={movie.title}
                            className="w-full rounded-lg"
                        />
                    </div>
                    
                    <div className="md:w-2/3">
                        <p className="text-gray-300 mb-4">{movie.desc}</p>
                        
                        <div className="mb-4">
                            <h3 className="text-xl font-semibold mb-2">Genre: {movie.genre?.name}</h3>
                        </div>
                        
                        <div className="mb-4">
                            <h3 className="text-xl font-semibold mb-2">Rating: {movie.rating}/10</h3>
                        </div>
                        
                        <div className="flex gap-4">
                            <a
                                href={movie.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded inline-block"
                            >
                                Watch Trailer
                            </a>
                            
                            <a
                                href={`/seats/${movie.id}`}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded inline-block"
                            >
                                Book Now
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}