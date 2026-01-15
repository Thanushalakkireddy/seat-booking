import { useState, useEffect } from "react";
import axios from "axios";

export default function Profile() {
    const [user, setUser] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Extract token to get user ID
    const extractUserIdFromToken = () => {
        const token = localStorage.getItem('token');

        if (!token) return null;

        try {
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
            return JSON.parse(jsonPayload).id;
        } catch (e) {
            console.error('Error decoding token:', e);
            return null;
        }
    };

    const userId = extractUserIdFromToken();

    useEffect(() => {
        if (!userId) {
            setError('Please log in to view your profile');
            setLoading(false);
            return;
        }

        const fetchUserProfile = async () => {
            try {
                const token = localStorage.getItem('token');

                if (!token) {
                    setError('Please log in to view your profile');
                    setLoading(false);
                    return;
                }

                // Fetch user profile
                const profileResponse = await axios.get(
                    `https://seat-booking-yfc8.onrender.com/api/user/profile/${userId}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );

                if (profileResponse.data.status) {
                    setUser(profileResponse.data.user);
                }

                // Fetch user's bookings
                const bookingsResponse = await axios.get(
                    `https://seat-booking-yfc8.onrender.com/api/user/booked/${userId}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );

                setBookings(bookingsResponse.data);
            } catch (err) {
                setError(err.message);
                console.error('Error fetching profile:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [userId]);

    if (loading) {
        return <div className="text-center p-8">Loading profile...</div>;
    }

    if (error) {
        return <div className="text-center p-8 text-red-500">{error}</div>;
    }

    if (!user) {
        return <div className="text-center p-8">User not found</div>;
    }

    return (
        <div className="p-4 max-w-4xl mx-auto">
            <div className="bg-gray-800 text-white p-6 rounded-lg shadow-md mb-6">
                <h1 className="text-3xl font-bold mb-2">User Profile</h1>
                <div className="border-t border-gray-600 pt-4 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h2 className="text-xl font-semibold mb-2">Personal Information</h2>
                            <p><span className="font-medium">Name:</span> {user.name || 'N/A'}</p>
                            <p><span className="font-medium">Email:</span> {user.email}</p>
                            <p><span className="font-medium">Role:</span> {user.role}</p>
                            <p><span className="font-medium">Member Since:</span> {new Date(user.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-4">Booking History</h2>
                
                {bookings.length === 0 ? (
                    <p className="text-gray-500">No bookings found.</p>
                ) : (
                    <div className="space-y-4">
                        {bookings.map((booking) => (
                            <div 
                                key={booking.id} 
                                className={`p-4 border rounded-lg ${
                                    booking.status === 'pending' ? 'bg-yellow-100' : 
                                    booking.status === 'cancelled' ? 'bg-red-100' : 'bg-green-50'
                                }`}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-xl font-semibold">
                                            {booking.movie?.title || 'Movie'}
                                        </h3>
                                        <p className="text-gray-600">
                                            Seats: {booking.seats?.join(', ') || 'N/A'}
                                        </p>
                                        <p className="text-gray-600">
                                            Date: {new Date(booking.bookingDate).toLocaleDateString()}
                                        </p>
                                        <p className={`mt-2 font-semibold ${
                                            booking.status === 'pending' ? 'text-yellow-600' : 
                                            booking.status === 'cancelled' ? 'text-red-600' : 'text-green-600'
                                        }`}>
                                            Status: {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                        </p>
                                        {booking.createdAt && (
                                            <p className="text-sm text-gray-500">
                                                Booked on: {new Date(booking.createdAt).toLocaleString()}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}