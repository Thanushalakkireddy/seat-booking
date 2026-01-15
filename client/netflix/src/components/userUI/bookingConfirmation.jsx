import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";

export default function BookingConfirmation() {
    const { bookingId } = useParams();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchBookingDetails();
    }, [bookingId]);

    const fetchBookingDetails = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Please log in to view booking details');
                setLoading(false);
                return;
            }

            const response = await axios.get(
                `https://seat-booking-yfc8.onrender.com/api/user/booking/${bookingId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.data.status) {
                setBooking(response.data.data);
            } else {
                setError('Failed to retrieve booking details');
            }
        } catch (err) {
            console.error('Error fetching booking:', err);
            setError(err.response?.data?.message || 'Error loading booking details');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="text-xl">Loading booking details...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-black text-white p-8 pt-24">
                <div className="text-center p-8 text-red-400 bg-gray-900 border border-red-900 rounded-lg max-w-2xl mx-auto shadow-lg">
                    <h3 className="text-xl font-bold mb-2">Error Loading Booking</h3>
                    <p className="mb-4">{error}</p>
                    <Link to="/bookings" className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors">
                        View All Bookings
                    </Link>
                </div>
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="min-h-screen bg-black text-white p-8 pt-24 flex items-center justify-center">
                <div className="text-center p-8 text-yellow-400 bg-gray-900 border border-yellow-900 rounded-lg max-w-2xl shadow-lg">
                    <h3 className="text-xl font-bold mb-2">Booking Not Found</h3>
                    <p className="mb-4">We couldn't find the booking details you're looking for.</p>
                    <Link to="/bookings" className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors">
                        View All Bookings
                    </Link>
                </div>
            </div>
        );
    }

    // Safe access to nested properties
    const movieTitle = booking.show?.movie?.title || booking.movie?.title || "Movie Title";
    const genreList = booking.show?.movie?.genre || booking.movie?.genre || [];
    const genreString = Array.isArray(genreList) ? genreList.map(g => g.name).join(", ") : "";
    const duration = booking.show?.movie?.duration || booking.movie?.duration || 0;
    const theatreName = booking.show?.theatre?.name || booking.theatre?.name || "Theatre";
    const theatreLocation = booking.show?.theatre?.location || booking.theatre?.location || "Location";
    const showTime = booking.show?.startTime || booking.showTime;
    const seats = booking.seats || [];
    const seatString = Array.isArray(seats) ? seats.join(", ") : seats;
    const seatCount = Array.isArray(seats) ? seats.length : 0;

    return (
        <div className="min-h-screen bg-black text-white p-8 pt-24">
            <div className="max-w-3xl mx-auto">
                <div className="bg-green-900/20 border border-green-500/50 text-green-100 p-6 rounded-lg mb-8 text-center animate-fade-in-down">
                    <div className="flex justify-center mb-4">
                        <div className="bg-green-500/20 p-3 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Booking Confirmed!</h1>
                    <p className="text-green-200/80 text-lg">Your tickets have been successfully booked.</p>
                    <p className="text-sm text-gray-400 mt-2">Booking ID: {booking.id}</p>
                </div>

                <div className="bg-gray-900 rounded-lg shadow-2xl overflow-hidden border border-gray-800">
                    <div className="p-8">
                        <div className="flex flex-col md:flex-row gap-8">
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold mb-1 text-white">{movieTitle}</h2>
                                <p className="text-gray-400 mb-6 text-sm">
                                    {genreString} • {duration} mins
                                </p>

                                <div className="space-y-4">
                                    <div className="flex items-start gap-4">
                                        <div className="w-8 text-gray-500">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-gray-400 text-xs uppercase tracking-wider">Theatre</p>
                                            <p className="font-semibold text-lg">{theatreName}</p>
                                            <p className="text-gray-500 text-sm">{theatreLocation}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="w-8 text-gray-500">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-gray-400 text-xs uppercase tracking-wider">Date & Time</p>
                                            <p className="font-semibold text-lg">
                                                {showTime ? new Date(showTime).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Date N/A'}
                                            </p>
                                            <p className="text-gray-500 text-sm">
                                                {showTime ? new Date(showTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : 'Time N/A'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="w-8 text-gray-500">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-gray-400 text-xs uppercase tracking-wider">Seats</p>
                                            <p className="font-semibold text-lg tracking-wider text-red-500">
                                                {seatString}
                                            </p>
                                            <p className="text-gray-500 text-sm">{seatCount} Tickets</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex-none w-full md:w-64 flex flex-col justify-center items-center bg-gray-800/50 p-6 rounded-lg border border-gray-700/50">
                                <div className="qr-code-placeholder w-32 h-32 bg-white p-2 mb-4 rounded">
                                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${booking.id}`} alt="Booking QR Code" className="w-full h-full" />
                                </div>
                                <p className="text-xs text-gray-500 text-center mb-4">Show this QR code at the entrance</p>
                                <div className="w-full border-t border-gray-700 pt-4 mt-2">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-gray-400">Total Amount</span>
                                        <span className="text-xl font-bold">₹{seatCount * 200}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 text-right">Inc. of all taxes</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-800 px-8 py-4 border-t border-gray-800 flex justify-between items-center">
                        <Link to="/" className="text-gray-400 hover:text-white transition-colors">
                            ← Back to Home
                        </Link>
                        <button onClick={() => window.print()} className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            Print Ticket
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}