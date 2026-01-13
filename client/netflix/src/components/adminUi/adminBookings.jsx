import { useState, useEffect } from "react";
import axios from "axios";

export default function AdminBookings() {
    const [bookings, setBookings] = useState([]);
    const [filteredBookings, setFilteredBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all'); // all, confirmed, cancelled, pending
    const [genreFilter, setGenreFilter] = useState('all'); // all genres
    const [movieFilter, setMovieFilter] = useState('all'); // all movies

    useEffect(() => {
        fetchBookings();
    }, []);
    
    useEffect(() => {
        // Apply filters when any filter changes
        let result = bookings;
        
        // Apply status filter
        if (statusFilter !== 'all') {
            result = result.filter(booking => booking.status === statusFilter);
        }
        
        // Apply genre filter
        if (genreFilter !== 'all') {
            result = result.filter(booking => 
                booking.movie && booking.movie.genre && 
                booking.movie.genre.name === genreFilter
            );
        }
        
        // Apply movie filter
        if (movieFilter !== 'all') {
            result = result.filter(booking => 
                booking.movie && booking.movie.title === movieFilter
            );
        }
        
        setFilteredBookings(result);
    }, [bookings, statusFilter, genreFilter, movieFilter]);

    const fetchBookings = async () => {
        try {
            const token = localStorage.getItem('token');

            if (!token) {
                setError('Admin authentication required');
                setLoading(false);
                return;
            }

            // Fetch all bookings
            const response = await axios.get(
                'http://localhost:8060/api/admin/all-bookings',
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            setBookings(response.data);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching bookings:', err);
        } finally {
            setLoading(false);
        }
    };

    const cancelBooking = async (bookingId) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');

            if (!token) {
                alert('Admin authentication required');
                return;
            }

            // Cancel the booking
            await axios.post(
                'http://localhost:8060/api/admin/cancel-booking',
                {
                    bookingId: bookingId
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            // Update local state to remove the cancelled booking
            setBookings(prevBookings => 
                prevBookings.filter(booking => booking.id !== bookingId)
            );
            
            alert('Booking cancelled successfully!');
        } catch (err) {
            console.error('Error cancelling booking:', err);
            alert('Error cancelling booking: ' + err.message);
        }
    };

    if (loading) {
        return <div className="text-center p-8">Loading bookings...</div>;
    }

    if (error) {
        return <div className="text-center p-8 text-red-500">{error}</div>;
    }

    if (bookings.length === 0) {
        return (
            <div className="p-4">
                <h2 className="text-2xl font-bold mb-4">All Bookings</h2>
                <p className="text-gray-500">No bookings found.</p>
            </div>
        );
    }

    // Extract unique genres and movies for filter options
    const uniqueGenres = [...new Set(bookings
        .filter(booking => booking.movie && booking.movie.genre)
        .map(booking => booking.movie.genre.name)
    )];
    
    const uniqueMovies = [...new Set(bookings
        .filter(booking => booking.movie)
        .map(booking => booking.movie.title)
    )];
    
    // Calculate counts for each status
    const statusCounts = {
        all: bookings.length,
        confirmed: bookings.filter(booking => booking.status === 'confirmed').length,
        pending: bookings.filter(booking => booking.status === 'pending').length,
        cancelled: bookings.filter(booking => booking.status === 'cancelled').length
    };
    
    // Calculate counts for each genre
    const genreCounts = {};
    uniqueGenres.forEach(genre => {
        genreCounts[genre] = bookings.filter(booking => 
            booking.movie && booking.movie.genre && booking.movie.genre.name === genre
        ).length;
    });
    
    // Calculate counts for each movie
    const movieCounts = {};
    uniqueMovies.forEach(movie => {
        movieCounts[movie] = bookings.filter(booking => 
            booking.movie && booking.movie.title === movie
        ).length;
    });
    
    return (
        <div className="min-h-screen bg-gray-100 text-gray-900 p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">All Bookings</h2>
            
            {/* Filter Controls */}
            <div className="mb-6 p-6 bg-white rounded-lg shadow-md border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Status Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
                        <select 
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Statuses ({statusCounts.all})</option>
                            <option value="confirmed">Confirmed ({statusCounts.confirmed})</option>
                            <option value="pending">Pending ({statusCounts.pending})</option>
                            <option value="cancelled">Cancelled ({statusCounts.cancelled})</option>
                        </select>
                    </div>
                    
                    {/* Genre Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Genre</label>
                        <select 
                            value={genreFilter}
                            onChange={(e) => setGenreFilter(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Genres ({bookings.length})</option>
                            {uniqueGenres.map(genre => (
                                <option key={genre} value={genre}>{genre} ({genreCounts[genre]})</option>
                            ))}
                        </select>
                    </div>
                    
                    {/* Movie Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Movie</label>
                        <select 
                            value={movieFilter}
                            onChange={(e) => setMovieFilter(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Movies ({bookings.length})</option>
                            {uniqueMovies.map(movie => (
                                <option key={movie} value={movie}>{movie} ({movieCounts[movie]})</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
            
            <div className="space-y-4">
                {filteredBookings.map((booking) => (
                    <div 
                        key={booking.id} 
                        className={`p-6 border rounded-lg shadow-sm ${
                            booking.status === 'pending' ? 'bg-yellow-50 border-yellow-200' : 
                            booking.status === 'cancelled' ? 'bg-red-50 border-red-200' : 
                            'bg-white border-gray-200'
                        }`}
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">
                                    {booking.movie?.title || 'Movie'}
                                </h3>
                                <p className="text-gray-600">
                                    User: {booking.user?.name || booking.userId}
                                </p>
                                <p className="text-gray-600">
                                    Seats: {booking.seats?.join(', ') || 'N/A'}
                                </p>
                                <p className="text-gray-600">
                                    Date: {new Date(booking.bookingDate).toLocaleDateString()}
                                </p>
                                <p className="text-gray-600">
                                    Created: {new Date(booking.createdAt).toLocaleString()}
                                </p>
                                <p className={`mt-2 font-semibold ${
                                    booking.status === 'pending' ? 'text-yellow-600' : 
                                    booking.status === 'cancelled' ? 'text-red-600' : 
                                    'text-green-600'
                                }`}>
                                    Status: {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                </p>
                            </div>
                            <div className="flex flex-col items-end">
                                {booking.status !== 'cancelled' && (
                                    <button
                                        onClick={() => cancelBooking(booking.id)}
                                        className="mt-2 bg-red-500 hover:bg-red-700 text-white py-1 px-3 rounded text-sm"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}