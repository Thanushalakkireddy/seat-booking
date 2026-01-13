import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const getDateKey = (date) => {
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return null;
    return d.toISOString().split("T")[0];
};

export default function SeatSelection() {
    const { id } = useParams(); // Movie ID from URL
    const [movie, setMovie] = useState(null);
    const [shows, setShows] = useState([]);
    const [selectedShow, setSelectedShow] = useState(null);
    const [seats, setSeats] = useState([]);
    const [bookedSeats, setBookedSeats] = useState(new Set());
    const [selectedSeats, setSelectedSeats] = useState(new Set());
    const [tempSelectedSeats, setTempSelectedSeats] = useState(new Set()); // For temporary selections
    const [tempSeatOwnership, setTempSeatOwnership] = useState({}); // Track which user owns each temp seat
    const [loading, setLoading] = useState(true);
    const [seatExpirations, setSeatExpirations] = useState({}); // Store expiration times (absolute timestamp)
    const [remainingTimes, setRemainingTimes] = useState({}); // Store remaining seconds for UI
    const [isBooking, setIsBooking] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const navigate = useNavigate();

    // Initialize currentUserId
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(atob(base64).split("").map(function(c) {
                    return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(""));
                setCurrentUserId(JSON.parse(jsonPayload).id);
            } catch (e) {
                console.error("Error decoding token:", e);
            }
        }
    }, []);

    // Restore selected show from sessionStorage
    useEffect(() => {
        if (shows.length > 0 && !selectedShow) {
            const savedShowId = sessionStorage.getItem(`lastSelectedShow_${id}`);
            if (savedShowId) {
                for (const group of shows) {
                    if (group.shows) {
                        const found = group.shows.find(s => s.id === savedShowId);
                        if (found) {
                            // Don't call handleShowSelect here to avoid clearing seats yet
                            setSelectedShow(found);
                            setSeats(generateSeats());
                            fetchBookedSeats(found.id);
                            break;
                        }
                    }
                }
            }
        }
    }, [shows, id]);

    // Restore/Sync selected seats from tempSeatOwnership
    useEffect(() => {
        if (!currentUserId) return;

        const mySeats = new Set();
        Object.entries(tempSeatOwnership).forEach(([seatId, ownerId]) => {
            if (ownerId === currentUserId) {
                mySeats.add(seatId);
            }
        });

        const current = Array.from(selectedSeats);
        const next = Array.from(mySeats);
        
        const isDifferent = current.length !== next.length || !current.every(v => mySeats.has(v));
        
        if (isDifferent && !isBooking) {
            setSelectedSeats(mySeats);
            setTempSelectedSeats(mySeats);
        }
    }, [tempSeatOwnership, currentUserId, isBooking]);

    // Fetch movie details and shows
    useEffect(() => {
        const fetchMovieAndShows = async () => {
            try {
                // Fetch Movie
                const movieRes = await axios.get(`http://localhost:8060/api/user/viewMovie/${id}`);
                setMovie(movieRes.data);

                // Fetch Shows
                const showsRes = await axios.get(`http://localhost:8060/api/user/shows/${id}`);
                const fetchedShows = showsRes.data.data || [];
                setShows(fetchedShows);
                
                const flatShows = fetchedShows.flatMap(group =>
                    Array.isArray(group.shows) ? group.shows : []
                );
                if (flatShows.length > 0) {
                    const initialKey = getDateKey(flatShows[0].startTime);
                    if (initialKey) {
                        setSelectedDate(initialKey);
                    }
                }
                
                setLoading(false);
            } catch (err) {
                console.error("Error fetching data:", err);
                setLoading(false);
            }
        };

        fetchMovieAndShows();
    }, [id]);

    // Timer logic to update countdowns
    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            const newRemainingTimes = {};
            let hasUpdates = false;
            let shouldRefresh = false;

            Object.entries(seatExpirations).forEach(([seatId, expiresAt]) => {
                if (!expiresAt) return;
                
                const expirationTime = new Date(expiresAt).getTime();
                const remaining = Math.max(0, Math.ceil((expirationTime - now) / 1000));
                
                newRemainingTimes[seatId] = remaining;
                hasUpdates = true;
                
                // If expired (hit 0 for the first time or is 0)
                if (remaining === 0) {
                    // Trigger refresh to sync with backend and release seat
                    shouldRefresh = true;
                }
            });

            if (hasUpdates || Object.keys(remainingTimes).length > 0) {
                 setRemainingTimes(newRemainingTimes);
            }
            
            if (shouldRefresh && selectedShow) {
                fetchBookedSeats(selectedShow.id);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [seatExpirations, selectedShow]);

    // Fetch booked seats when a show is selected
    const fetchBookedSeats = async (showId) => {
        if (!showId) return;
        try {
            const response = await axios.get(`http://localhost:8060/api/user/booked-seats/${showId}`);
            setBookedSeats(new Set(response.data.confirmedSeats));
            
            // Handle pending seats
            const ownership = {};
            const expirations = {};
            
            response.data.pendingSeats.forEach(s => {
                ownership[s.seatId] = s.userId;
                expirations[s.seatId] = s.expiresAt;
            });
            
            setTempSeatOwnership(ownership);
            setSeatExpirations(expirations);
        } catch (err) {
            console.error("Error fetching booked seats:", err);
        }
    };

    // Generate seats helper
    const generateSeats = () => {
        const newSeats = [];
        for (let row = 0; row < 6; row++) { 
            const seatRow = [];
            for (let col = 0; col < 10; col++) {
                const seatId = `${String.fromCharCode(65 + row)}${col + 1}`; 
                seatRow.push({
                    id: seatId,
                    row: row,
                    col: col,
                    price: 200 // Default price
                });
            }
            newSeats.push(seatRow);
        }
        return newSeats;
    };

    // Handle show selection
    const handleShowSelect = (show) => {
        setSelectedShow(show);
        // Reset seat selections
        setSelectedSeats(new Set());
        setTempSelectedSeats(new Set());
        setSeats(generateSeats()); // Regenerate seats (visual only)
        fetchBookedSeats(show.id);
    };

    // Function to create temporary booking
    const createTempBooking = async (seat) => {
        if (!selectedShow) {
            alert("Please select a show first.");
            return;
        }

        try {
            const token = localStorage.getItem('token');

            if (!token || !currentUserId) {
                alert('Please log in to select seats');
                return;
            }

            // Create temporary booking
            const response = await axios.post(
                'http://localhost:8060/api/user/temp-booking',
                {
                    showId: selectedShow.id,
                    seats: [seat.id],
                    bookingDate: new Date().toISOString(),
                    status: 'pending'
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.data.seat && response.data.seat.lockExpiresAt) {
                setSeatExpirations(prev => ({
                    ...prev,
                    [seat.id]: response.data.seat.lockExpiresAt
                }));

            }

            return response.data.bookingId; // Return the booking ID for this seat
        } catch (err) {
            console.error('Error creating temporary booking:', err);
            return null;
        }
    };

    // Function to cancel temporary booking
    const cancelTempBooking = async (seatId) => {
        try {
            const token = localStorage.getItem('token');

            if (!token) {
                return;
            }

            // Cancel the booking
            await axios.post(
                'http://localhost:8060/api/user/cancel-booking',
                {
                    showId: selectedShow.id,
                    seats: [seatId]
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            
            // Update local state to remove ownership
            setTempSeatOwnership(prev => {
                const newOwnership = { ...prev };
                delete newOwnership[seatId];
                return newOwnership;
            });
        } catch (err) {
            console.error('Error cancelling booking:', err);
        }
    };

    // Function to format time as MM:SS
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    // Function to handle seat click
    const handleSeatClick = async (seat) => {
        // If seat is already booked (confirmed), don't allow selection
        if (bookedSeats.has(seat.id)) {
            return;
        }

        // Extract current user ID
        const token = localStorage.getItem('token');

        let currentUserId = null;
        if (token) {
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
                currentUserId = JSON.parse(jsonPayload).id;
            } catch (e) {
                console.error('Error decoding token:', e);
                return;
            }
        } else {
            alert('Please log in to select seats');
            return;
        }

        // Check if seat is temporarily selected by another user
        if (tempSeatOwnership[seat.id] && tempSeatOwnership[seat.id] !== currentUserId) {
            // This seat is temporarily selected by another user, so don't allow interaction
            alert('This seat is temporarily selected by another user');
            return;
        }

        // Manual unselect: if selected or temporarily selected by current user
        if (selectedSeats.has(seat.id) || tempSelectedSeats.has(seat.id)) {
            // Optimistically update UI state
            setSelectedSeats(prev => {
                const ns = new Set(prev);
                ns.delete(seat.id);
                return ns;
            });
            setTempSelectedSeats(prev => {
                const nt = new Set(prev);
                nt.delete(seat.id);
                return nt;
            });
            setSeatExpirations(prev => {
                const ne = { ...prev };
                delete ne[seat.id];
                return ne;
            });
            setTempSeatOwnership(prev => {
                const no = { ...prev };
                delete no[seat.id];
                return no;
            });

            // Release on backend immediately
            await cancelTempBooking(seat.id);
            // Re-sync booked/held seats so other users reflect change
            if (selectedShow?.id) {
                fetchBookedSeats(selectedShow.id);
            }
            return;
        }

        // Add seat to temporary selection
        const newTempSelectedSeats = new Set(tempSelectedSeats);
        newTempSelectedSeats.add(seat.id);
        setTempSelectedSeats(newTempSelectedSeats);
        
        // Also add to main selected set for UI consistency
        const newSelected = new Set(selectedSeats);
        newSelected.add(seat.id);
        setSelectedSeats(newSelected);

        // Add ownership info for this seat
        setTempSeatOwnership(prev => ({
            ...prev,
            [seat.id]: currentUserId
        }));

        // Create temporary booking
        await createTempBooking(seat);
    };

    // Function to confirm seat selections (Booking)
    const handleBooking = async () => {
        if (!selectedShow) {
            alert("Please select a show first.");
            return;
        }

        if (selectedSeats.size === 0) {
            alert("Please select at least one seat");
            return;
        }

        setIsBooking(true);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Please log in to book tickets');
                // navigate('/login'); // Assuming you have a login route, or redirect to home
                setIsBooking(false);
                return;
            }

            const response = await axios.post(
                'http://localhost:8060/api/user/book',
                {
                    showId: selectedShow.id,
                    seats: Array.from(selectedSeats)
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.data.status && response.data.bookingId) {
                navigate(`/booking/${response.data.bookingId}`);
            } else if (response.data.status) {
                // Fallback if bookingId is missing but status is true (should not happen with new backend)
                navigate('/bookings'); // Removed state dependency as requested
            } else {
                alert(response.data.message || 'Booking failed. Please try again.');
                setIsBooking(false);
            }
        } catch (err) {
            console.error('Booking failed:', err);
            alert(err.response?.data?.message || 'Booking failed. Please try again.');
            setIsBooking(false);
        }
    };
    
    

    // Calculate total price
    const calculateTotal = () => {
        let total = 0;
        selectedSeats.forEach(seatId => {
            // Find seat object to get price
            for (const row of seats) {
                const seat = row.find(s => s.id === seatId);
                if (seat) {
                    total += seat.price;
                    break;
                }
            }
        });
        return total;
    };
    
    // Shows are already grouped by theatre from the API
    const theatreGroups = Array.isArray(shows) ? shows : [];
    const allShows = theatreGroups.flatMap(group =>
        Array.isArray(group.shows) ? group.shows : []
    );
    const availableDates = Array.from(
        new Set(
            allShows
                .map(show => getDateKey(show.startTime))
                .filter(Boolean)
        )
    );

    if (loading) return <div className="text-white text-center p-10">Loading...</div>;

    return (
        <div className="min-h-screen bg-black text-white p-8 pt-24">
            <div className="max-w-6xl mx-auto">
                {movie && (
                    <div className="mb-8 border-b border-gray-800 pb-8">
                        <h1 className="text-4xl font-bold mb-2">{movie.title || "Untitled Movie"}</h1>
                        <p className="text-gray-400">
                            {(() => {
                                const genres = Array.isArray(movie?.genre)
                                    ? movie.genre
                                    : typeof movie?.genre === "object" && movie?.genre !== null
                                        ? [movie.genre]
                                        : typeof movie?.genre === "string"
                                            ? movie.genre.split(",").map(g => ({ name: g.trim() }))
                                            : [];
                                return genres.map(g => g?.name || g).join(", ");
                            })()}
                            {" • "}{movie.duration || 'N/A'} mins
                        </p>
                    </div>
                )}
                
                {/* Show Selection Section */}
                <div className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-red-500">Select Theatre & Show Time</h2>
                    {availableDates.length > 0 && (
                        <div className="mb-4 flex flex-wrap gap-3">
                            {availableDates.map(dateKey => {
                                const dateObj = new Date(dateKey);
                                const isActive = selectedDate === dateKey;
                                return (
                                    <button
                                        key={dateKey}
                                        onClick={() => setSelectedDate(dateKey)}
                                        className={`px-4 py-2 rounded border transition-colors ${
                                            isActive
                                                ? "bg-red-600 border-red-600 text-white"
                                                : "bg-transparent border-gray-600 text-gray-300 hover:border-red-500 hover:text-red-500"
                                        }`}
                                    >
                                        {dateObj.toLocaleDateString()}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                    <div className="space-y-6">
                        {theatreGroups.map((group) => (
                            <div key={group?.theatre?.id || Math.random()} className="bg-gray-900 p-4 rounded-lg">
                                <h3 className="text-xl font-medium mb-3">{group?.theatre?.name || "Unknown Theatre"} <span className="text-sm text-gray-400">({group?.theatre?.location || "Unknown Location"})</span></h3>
                                <div className="flex flex-wrap gap-3">
                                    {Array.isArray(group?.shows) &&
                                        group.shows
                                            .filter(show => {
                                                if (!selectedDate) return true;
                                                const key = getDateKey(show.startTime);
                                                return key === selectedDate;
                                            })
                                            .map(show => (
                                            <button
                                                key={show.id}
                                                onClick={() => handleShowSelect(show)}
                                                className={`px-4 py-2 rounded border transition-colors ${
                                                    selectedShow?.id === show.id
                                                    ? "bg-red-600 border-red-600 text-white"
                                                    : "bg-transparent border-gray-600 text-gray-300 hover:border-red-500 hover:text-red-500"
                                            }`}
                                        >
                                            {new Date(show.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                        {theatreGroups.length === 0 && <p className="text-gray-500">No shows available for this movie.</p>}
                    </div>
                </div>

                {/* Seat Selection Section - Only visible if show is selected */}
                {selectedShow ? (
                    <>
                        <div className="mb-8">
                            <div className="w-full h-12 bg-gray-800 mb-12 relative transform perspective-500 rounded-lg overflow-hidden shadow-[0_10px_30px_rgba(255,255,255,0.1)]">
                                <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm font-medium tracking-widest">SCREEN THIS WAY</div>
                                <div className="absolute bottom-0 w-full h-1 bg-gradient-to-t from-white/20 to-transparent"></div>
                            </div>

                            <div className="flex flex-col gap-2 items-center">
                                {seats.map((row, rowIndex) => (
                                    <div key={rowIndex} className="flex gap-2">
                                        {row.map((seat) => {
                                            const isBooked = bookedSeats.has(seat.id);
                                            const isSelected = selectedSeats.has(seat.id);
                                            const token = localStorage.getItem('token');
                                            let currentUserId = null;
                                            if (token) {
                                                try {
                                                    const base64Url = token.split('.')[1];
                                                    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                                                    const jsonPayload = decodeURIComponent(atob(base64).split("").map(function(c) {
                                                        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
                                                    }).join(""));
                                                    currentUserId = JSON.parse(jsonPayload).id;
                                                } catch {
                                                    currentUserId = null;
                                                }
                                            }
                                            
                                            // Check locked status
                                            const lockedByOther = tempSeatOwnership[seat.id] && tempSeatOwnership[seat.id] !== currentUserId;
                                            const isLocked = seatExpirations[seat.id] && new Date(seatExpirations[seat.id]) > new Date();
                                            
                                            // Determine seat class
                                            let seatClass = "w-8 h-8 rounded text-xs flex items-center justify-center transition-all font-bold border ";
                                            
                                            if (isBooked) {
                                                seatClass += "bg-gray-600 text-gray-400 border-gray-600 cursor-not-allowed";
                                            } else if (lockedByOther && isLocked) {
                                                seatClass += "bg-[#8B4513] text-white border-[#8B4513] cursor-not-allowed opacity-80";
                                            } else if (isSelected) {
                                                seatClass += "bg-green-600 text-white border-green-600 shadow-lg scale-110 z-10";
                                            } else {
                                                seatClass += "bg-white text-gray-900 border-gray-300 hover:bg-green-100 cursor-pointer";
                                            }

                                            return (
                                                <div key={seat.id} className="relative group">
                                                    <button
                                                        onClick={() => handleSeatClick(seat)}
                                                        disabled={isBooked}
                                                        className={seatClass}
                                                        title={`Row ${seat.row} Seat ${seat.col} - ₹${seat.price}`}
                                                    >
                                                        {seat.id}
                                                    </button>
                                                    {/* Tooltip or Timer Overlay */}
                                                    {(isSelected || (lockedByOther && isLocked)) && remainingTimes[seat.id] > 0 && (
                                                         <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 text-[10px] bg-black/80 px-1 rounded text-white pointer-events-none whitespace-nowrap z-10">
                                                            {formatTime(remainingTimes[seat.id])}
                                                         </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="flex justify-center gap-6 mb-8 text-sm text-gray-400">
                            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-green-600 border border-green-600 rounded"></div> Selected</div>
                            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-[#8B4513] border border-[#8B4513] rounded"></div> Temporarily Selected</div>
                            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-gray-600 border border-gray-600 rounded"></div> Already Booked</div>
                            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-white border border-gray-300 rounded"></div> Available</div>
                        </div>

                        {/* Summary Bar */}
                        <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 p-4">
                            <div className="max-w-6xl mx-auto flex justify-between items-center">
                                <div>
                                    <p className="text-gray-400 text-sm">Selected Seats: <span className="text-white font-medium">{Array.from(selectedSeats).join(", ") || "None"}</span></p>
                                    <p className="text-xl font-bold">Total: ₹{calculateTotal()}</p>
                                </div>
                                <button
                                    onClick={handleBooking}
                                    disabled={selectedSeats.size === 0 || isBooking}
                                    className={`px-8 py-3 rounded font-bold text-lg transition-colors ${
                                        selectedSeats.size > 0 && !isBooking
                                            ? "bg-red-600 hover:bg-red-700 text-white"
                                            : "bg-gray-700 text-gray-400 cursor-not-allowed"
                                    }`}
                                >
                                    {isBooking ? 'Booking...' : 'Book Tickets'}
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-20 bg-gray-900 rounded-lg border border-gray-800">
                        <h3 className="text-xl text-gray-300 mb-2">Please select a showtime to view seats</h3>
                        <p className="text-gray-500">Choose a theatre and time from the list above</p>
                    </div>
                )}
            </div>
        </div>
    );
}
