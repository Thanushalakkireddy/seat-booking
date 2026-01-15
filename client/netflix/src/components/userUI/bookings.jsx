import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";

export default function Bookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const location = useLocation();

    useEffect(() => {
        fetchBookings();
    }, []);
    
    // Timer to force updates for displaying countdown
    useEffect(() => {
        const interval = setInterval(() => {
            // Force re-render to update timer displays
            setRefreshTrigger(prev => prev + 1);
        }, 1000); // Update every second
        
        return () => clearInterval(interval);
    }, []);

    const fetchBookings = async () => {
        try {
            const token = localStorage.getItem('token');

            if (!token) {
                setError('Please log in to view bookings');
                setLoading(false);
                return;
            }

            // Decode token to get user ID
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split("")
                    .map(function (c) {
                        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
                    })
                    .join("")
            );
            const userId = JSON.parse(jsonPayload).id;

            // Fetch user's bookings
            const response = await axios.get(
                `https://seat-booking-yfc8.onrender.com/api/user/booked/${userId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            // Include all bookings (confirmed and pending, but not cancelled)
            let allBookings = [];
            if (Array.isArray(response.data)) {
                allBookings = response.data.filter(booking => booking.status !== 'cancelled');
            } else if (response.data && Array.isArray(response.data.data)) {
                // Handle case where data might be wrapped
                allBookings = response.data.data.filter(booking => booking.status !== 'cancelled');
            }
            
            setBookings(allBookings);
        } catch (err) {
            setError(err.message || "Failed to load bookings");
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
                alert('Please log in to cancel bookings');
                return;
            }

            // Find the booking to get movieId and seats
            const booking = bookings.find(b => b.id === bookingId);
            if (!booking) return;

            // Cancel the booking
            await axios.post(
                'https://seat-booking-yfc8.onrender.com/api/user/cancel-confirmed-booking',
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
        return <div className="min-h-screen bg-black text-white p-8 pt-24 text-center text-xl">Loading bookings...</div>;
    }

    if (error) {
        return (
            <div className="min-h-screen bg-black text-white p-8 pt-24">
                <div className="text-center p-8 text-red-400 bg-gray-900 border border-red-900 rounded-lg max-w-2xl mx-auto shadow-lg">
                    <h3 className="text-xl font-bold mb-2">Error Loading Bookings</h3>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    if (bookings.length === 0) {
        return (
            <div className="min-h-screen bg-black text-white p-8 pt-24">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl font-bold mb-8 border-b border-gray-800 pb-4">Your Bookings</h2>
                    
                    {location.state?.bookingSuccess && (
                        <div className="bg-green-900/30 border border-green-500 text-green-100 p-6 rounded-lg mb-8 text-center">
                            <h3 className="font-bold text-2xl mb-2">Booking Confirmed!</h3>
                            <p>Your seats have been successfully booked.</p>
                        </div>
                    )}

                    {!location.state?.bookingSuccess && (
                        <div className="bg-gray-900 p-12 rounded-lg shadow-lg max-w-md mx-auto text-center border border-gray-800">
                            <p className="text-gray-300 mb-8 text-lg">You haven't booked any movies yet.</p>
                            <Link to="/view-movie" className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full transition duration-300 shadow-lg hover:shadow-red-900/50">
                                Browse Movies
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white p-8 pt-24">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl font-bold mb-8 text-white border-b border-gray-800 pb-4">Your Bookings</h2>
                
                {location.state?.bookingSuccess && (
                    <div className="bg-green-900/20 border border-green-500/50 text-green-100 p-4 rounded-lg mb-8 shadow-lg flex items-center gap-4 animate-fade-in-down">
                        <div className="bg-green-500/20 p-2 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Booking Confirmed!</h3>
                            <p className="text-sm text-green-200/80">Your seats have been successfully booked. Enjoy the show!</p>
                        </div>
                    </div>
                )}

                {/* Using refreshTrigger to force updates for timer display */}
                <div style={{ display: 'none' }}>{refreshTrigger}</div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bookings.map((booking) => {
                    // Calculate remaining time for pending bookings
                    let remainingTime = null;
                    if (booking.status === 'pending') {
                        // Try to get the creation time from different possible fields
                        let bookingTime = null;
                        if (booking.createdAt) {
                            bookingTime = new Date(booking.createdAt);
                        } else if (booking.bookingDate) {
                            bookingTime = new Date(booking.bookingDate);
                        }
                        
                        if (bookingTime && !isNaN(bookingTime.getTime())) {
                            const now = new Date();
                            const elapsed = (now - bookingTime) / 1000; // in seconds
                            const remaining = Math.max(0, 60 - Math.floor(elapsed)); // max 60 seconds
                            
                            const mins = Math.floor(remaining / 60);
                            const secs = remaining % 60;
                            remainingTime = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
                        } else {
                            // Fallback if no timestamp is available
                            remainingTime = '1:00';
                        }
                    }
                    
                    return (
                        <div 
                            key={booking.id} 
                            className={`p-5 border rounded-lg shadow-lg transition-all hover:transform hover:scale-[1.01] ${
                                booking.status === 'pending' 
                                    ? 'bg-yellow-900/20 border-yellow-600/50' 
                                    : 'bg-gray-900 border-gray-700'
                            }`}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-semibold text-white mb-2">
                                        {booking.movie?.title || 'Movie'}
                                    </h3>
                                    <div className="space-y-1 text-sm">
                                        <p className="text-gray-300">
                                            <span className="text-gray-500 mr-2">Seats:</span>
                                            {booking.seats.join(', ')}
                                        </p>
                                        <p className="text-gray-300">
                                            <span className="text-gray-500 mr-2">Date:</span>
                                            {new Date(booking.bookingDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className={`mt-3 font-medium px-3 py-1 rounded-full inline-block text-xs uppercase tracking-wide ${
                                        booking.status === 'pending' ? 'bg-yellow-900/40 text-yellow-400 border border-yellow-700/50' : 'bg-green-900/40 text-green-400 border border-green-700/50'
                                    }`}>
                                        {booking.status}
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    {booking.status === 'pending' ? (
                                        <div className="mt-2 text-right">
                                            <Link to={`/watch/${booking.movie?.id || booking.movie?._id}`} className="text-blue-400 hover:text-blue-300 text-sm hover:underline">
                                                View Movie
                                            </Link>
                                            <p className="text-xs text-yellow-500 mt-1 font-mono bg-yellow-900/30 px-2 py-1 rounded">
                                                ⏱ {remainingTime}
                                            </p>
                                        </div>
                                    ) : (
                                        <Link to={`/watch/${booking.movie?.id || booking.movie?._id}`} className="text-blue-400 hover:text-blue-300 text-sm hover:underline">
                                            View Movie
                                        </Link>
                                    )}
                                    <button
                                        onClick={() => cancelBooking(booking.id)}
                                        className="mt-2 bg-red-600/80 hover:bg-red-600 text-white py-1.5 px-4 rounded text-xs transition-colors border border-red-500/50"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    </div>
    );
}