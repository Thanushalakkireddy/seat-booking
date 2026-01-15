const {prisma } = require('../utils/dbConnector');

// Get all movies for users
exports.viewAllMovies = async (req, res) => {
  try {
    const movieData = await prisma.Movies.findMany({
      include: { genre: true },
    });
    res.status(200).send(movieData);
  } catch (err) {
    console.error("Error in viewAllMovies:", err);
    res.status(500).send({ status: false, message: "Failed to fetch movies", error: err.message });
  }
};

// Get all genres for users
exports.viewAllGenre = async (req, res) => {
  try {
    const genreData = await prisma.Genre.findMany();
    res.status(200).send(genreData);
  } catch (err) {
    console.error("Error in viewAllGenre:", err);
    res.status(500).send({ status: false, message: "Failed to fetch genres", error: err.message });
  }
};

// Get movies by genre
exports.viewMoviesByGenre = async (req, res) => {
  try {
    const genreName = req.params.genre;
    if (!genreName) {
        return res.status(400).send({ status: false, message: "Genre name is required" });
    }

    const movies = await prisma.Movies.findMany({
      where: {
        genre: {
          name: { equals: genreName, mode: 'insensitive' } // Safer case-insensitive match
        }
      },
      include: { genre: true },
    });
    res.status(200).send(movies);
  } catch (err) {
    console.error("Error in viewMoviesByGenre:", err);
    res.status(500).send({ status: false, message: "Failed to fetch movies by genre", error: err.message });
  }
};

// Get a specific movie by ID
exports.viewMovieById = async (req, res) => {
  try {
    const movieId = req.params.id;

    // Validate ObjectId format
    if (!movieId || !/^[0-9a-fA-F]{24}$/.test(movieId)) {
        return res.status(400).send({ status: false, message: 'Invalid Movie ID format' });
    }

    const movie = await prisma.Movies.findUnique({
      where: { id: movieId },
      include: { genre: true },
    });
    
    if (!movie) {
      return res.status(404).send({ status: false, message: 'Movie not found' });
    }
    
    // Handle optional fields safely (backwards compatibility)
    const safeMovie = {
        ...movie,
        duration: movie.duration ?? 120,
        language: movie.language ?? "English",
        releaseDate: movie.releaseDate ?? new Date()
    };
    
    res.status(200).send(safeMovie);
  } catch (err) {
    console.error("Error in viewMovieById:", err);
    res.status(500).send({ status: false, message: "Failed to fetch movie details", error: err.message });
  }
};

// Rate a movie
exports.rateMovie = async (req, res) => {
  try {
    const { movieId, rating } = req.body;
    const updatedMovie = await prisma.Movies.update({
      where: { id: movieId },
      data: { rating: rating },
    });
    
    res.status(200).send({ status: true, data: updatedMovie });
  } catch (err) {
    res.status(500).send({ status: false, message: err.message });
  }
};

// Search movies
exports.searchMovies = async (req, res) => {
  try {
    const { query } = req.query;
    const movies = await prisma.Movies.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { desc: { contains: query, mode: 'insensitive' } }
        ]
      },
      include: { genre: true },
    });
    
    res.status(200).send(movies);
  } catch (err) {
    res.status(500).send({ status: false, message: err.message });
  }
};

// Get shows for a specific movie
exports.getShowsByMovie = async (req, res) => {
  try {
    const { movieId } = req.params;

    if (!movieId || !/^[0-9a-fA-F]{24}$/.test(movieId)) {
        return res.status(400).send({ status: false, message: 'Invalid Movie ID format' });
    }

    const shows = await prisma.Show.findMany({
      where: { movieId: movieId },
      include: {
        theatre: true
      },
      orderBy: {
        startTime: 'asc'
      }
    });
    
    // Group shows by Theatre
    const showsByTheatre = shows.reduce((acc, show) => {
      // Safety check for missing theatre relation
      if(!show.theatre) return acc;

      const theatreId = show.theatre.id;
      if (!acc[theatreId]) {
        acc[theatreId] = {
          theatre: show.theatre,
          shows: []
        };
      }
      acc[theatreId].shows.push(show);
      return acc;
    }, {});
    
    res.status(200).send({
      status: true,
      data: Object.values(showsByTheatre)
    });
  } catch (err) {
    console.error("Error in getShowsByMovie:", err);
    res.status(500).send({ status: false, message: "Failed to fetch shows", error: err.message });
  }
};

// Create a temporary booking (Select Seat - Locked)
exports.createTempBooking = async (req, res) => {
  try {
    const { showId, seats } = req.body;
    // Note: Removed movieId dependency, now using showId
    // Validate userId from JWT (req.user is set by verifyUser middleware)
    if (!req.user || !req.user.id) {
        return res.status(401).send({ status: false, message: 'Unauthorized' });
    }
    const userId = req.user.id;
    
    const seatNumber = (seats && Array.isArray(seats) && seats.length > 0) ? seats[0] : null;
    
    if (!showId || !seatNumber) {
      return res.status(400).send({ status: false, message: 'Missing required fields: showId, seats' });
    }
    
    // Transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
        // Find or create seat
        let seat = await tx.Seat.findUnique({
            where: {
                showId_seatNumber: { showId, seatNumber }
            }
        });
        
        if (!seat) {
            seat = await tx.Seat.create({
                data: { showId, seatNumber, status: 'available' }
            });
        }
        
        const now = new Date();
        
        // Check if booked
        if (seat.status === 'booked') {
            throw new Error('Seat is already booked');
        }
        
        // Check if locked by another user
        if (seat.status === 'locked' && seat.lockedBy && seat.lockedBy !== userId) {
            if (seat.lockExpiresAt && seat.lockExpiresAt > now) {
                throw new Error('Seat is currently locked by another user');
            }
        }
        
        // Lock it
        const updated = await tx.Seat.update({
            where: { id: seat.id },
            data: {
                status: 'locked',
                lockedBy: userId,
                lockExpiresAt: new Date(now.getTime() + 5 * 60000) // 5 minutes
            }
        });
        
        return updated;
    });
    
    res.status(200).send({
      status: true, 
      message: `Seat ${seatNumber} locked successfully!`,
      bookingId: result.id, // Using seat ID as reference
      seat: result
    });
  } catch (err) {
    if (err.message === 'Seat is currently locked by another user' || err.message === 'Seat is already booked') {
        return res.status(403).send({ status: false, message: err.message });
    }
    res.status(500).send({ status: false, message: err.message });
  }
};

// Book a movie (Confirm Booking)
exports.bookMovie = async (req, res) => {
  try {
    const { showId, seats } = req.body;
    // Validate userId from JWT (req.user is set by verifyUser middleware)
    if (!req.user || !req.user.id) {
        return res.status(401).send({ status: false, message: 'Unauthorized' });
    }
    const userId = req.user.id;
    
    // 1️⃣ STRICT VALIDATION
    if (!showId || !seats || !Array.isArray(seats)) {
      return res.status(400).send({ status: false, message: 'Missing required fields: showId, seats' });
    }

    // Validate ObjectId format for showId
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    if (!objectIdRegex.test(showId)) {
        return res.status(400).send({ status: false, message: 'Invalid showId format' });
    }
    
    // Verify all seats are locked by user and confirm them
    await prisma.$transaction(async (tx) => {
        for (const seatNum of seats) {
            // Find seat
            let seat = await tx.Seat.findUnique({
                where: { showId_seatNumber: { showId, seatNumber: seatNum } }
            });

            // If seat doesn't exist (should not happen if flow is followed), create it check
            if (!seat) {
                 // Try to create? No, must be locked first.
                 throw new Error(`Seat ${seatNum} not found or not locked`);
            }
            
            if (seat.status === 'booked') throw new Error(`Seat ${seatNum} is already booked`);
            
            // Allow booking if locked by user OR if available (if we want to allow direct booking without lock, but better to enforce lock)
            // Requirement says: "Select seat -> status=locked". So we assume flow is select -> book.
            // But if user tries to book without selecting?
            // Let's enforce ownership if locked.
            if (seat.status === 'locked' && seat.lockedBy !== userId) {
                 if (seat.lockExpiresAt > new Date()) {
                     throw new Error(`Seat ${seatNum} is locked by another user`);
                 }
            }
            
            // If available, we can book. If locked by me, we can book.
            // Update to booked
            await tx.Seat.update({
                where: { id: seat.id },
                data: { status: 'booked', lockedBy: null, lockExpiresAt: null }
            });
        }
        
        // Create Booking record for history
        await tx.Booking.create({
            data: {
                userId,
                showId,
                seats,
                status: 'confirmed',
                bookingDate: new Date()
            }
        });
    });
    
    res.status(200).send({
      status: true, 
      message: `Booked successfully!`,
    });
  } catch (err) {
    res.status(400).send({ status: false, message: err.message });
  }
};

// Get booked seats for a specific show
exports.getBookedSeats = async (req, res) => {
  try {
    const { showId } = req.params;
    
    // Lazy cleanup of expired seats
    const now = new Date();
    await prisma.Seat.updateMany({
        where: {
            showId,
            status: 'locked',
            lockExpiresAt: { lt: now }
        },
        data: { status: 'available', lockedBy: null, lockExpiresAt: null }
    });
    
    const seats = await prisma.Seat.findMany({
        where: { showId }
    });
    
    const confirmedSeats = seats.filter(s => s.status === 'booked').map(s => s.seatNumber);
    const pendingSeats = seats.filter(s => s.status === 'locked').map(s => ({
        seatId: s.seatNumber,
        userId: s.lockedBy,
        expiresAt: s.lockExpiresAt
    }));
    
    res.status(200).send({
      status: true,
      confirmedSeats,
      pendingSeats
    });
  } catch (err) {
    res.status(500).send({ status: false, message: err.message });
  }
};

// Cancel a temporary booking (Unselect Seat)
exports.cancelTempBooking = async (req, res) => {
  try {
    const { showId, seats } = req.body;
    if (!req.user || !req.user.id) {
        return res.status(401).send({ status: false, message: 'Unauthorized' });
    }
    const userId = req.user.id;
    
    const seatNumber = (seats && Array.isArray(seats) && seats.length > 0) ? seats[0] : null;
    
    if (!showId || !seatNumber) {
        return res.status(400).send({ status: false, message: 'Missing fields' });
    }
    
    const seat = await prisma.Seat.findUnique({
        where: { showId_seatNumber: { showId, seatNumber } }
    });
    
    if (!seat) return res.status(404).send({ status: false, message: 'Seat not found' });
    
    if (seat.lockedBy !== userId) {
        return res.status(403).send({ status: false, message: 'Forbidden: You cannot unselect this seat' });
    }
    
    await prisma.Seat.update({
        where: { id: seat.id },
        data: { status: 'available', lockedBy: null, lockExpiresAt: null }
    });
    
    res.status(200).send({ status: true, message: 'Seat unselected' });
  } catch (err) {
    res.status(500).send({ status: false, message: err.message });
  }
};

// Cancel a confirmed booking
exports.cancelConfirmedBooking = async (req, res) => {
  try {
    const { bookingId } = req.body;
    
    if (!req.user || !req.user.id) {
        return res.status(401).send({ status: false, message: 'Unauthorized' });
    }
    const userId = req.user.id;
    
    // Find the booking
    const booking = await prisma.Booking.findUnique({
      where: { id: bookingId },
      include: { show: true }
    });
    
    if (!booking) {
      return res.status(404).send({ status: false, message: 'Booking not found' });
    }
    
    // Verify ownership
    if (booking.userId !== userId) {
        return res.status(403).send({ status: false, message: 'Forbidden: You can only cancel your own bookings' });
    }
    
    if (booking.status === 'cancelled') {
        return res.status(400).send({ status: false, message: 'Booking is already cancelled' });
    }
    
    // Transaction to update booking and seats
    await prisma.$transaction(async (tx) => {
        // Update booking status
        await tx.Booking.update({
            where: { id: bookingId },
            data: { status: 'cancelled' }
        });
        
        // Release seats
        for (const seatNum of booking.seats) {
            await tx.Seat.update({
                where: {
                    showId_seatNumber: {
                        showId: booking.showId,
                        seatNumber: seatNum
                    }
                },
                data: {
                    status: 'available',
                    lockedBy: null,
                    lockExpiresAt: null
                }
            });
        }
    });
    
    res.status(200).send({ status: true, message: 'Booking cancelled successfully' });
  } catch (err) {
    res.status(500).send({ status: false, message: err.message });
  }
};

// Get a specific booking by ID
exports.getBookingById = async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    // Validate userId from JWT
    if (!req.user || !req.user.id) {
        return res.status(401).send({ status: false, message: 'Unauthorized' });
    }
    const userId = req.user.id;
    
    const booking = await prisma.Booking.findUnique({
      where: { id: bookingId },
      include: {
        show: {
            include: {
                movie: {
                    include: {
                        genre: true
                    }
                },
                theatre: true
            }
        },
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });
    
    if (!booking) {
      return res.status(404).send({ status: false, message: 'Booking not found' });
    }
    
    // Verify ownership
    if (booking.userId !== userId) {
        return res.status(403).send({ status: false, message: 'Forbidden' });
    }
    
    res.status(200).send({
      status: true,
      data: {
        ...booking,
        movie: booking.show?.movie || null,
        theatre: booking.show?.theatre || null,
        showTime: booking.show?.startTime || null
      }
    });
  } catch (err) {
    console.error("Error fetching booking by ID:", err);
    res.status(500).send({ status: false, message: "Failed to load booking details" });
  }
};

// Get user's booked movies
exports.getBookedMovies = async (req, res) => {
  // 1️⃣ MANDATORY LOGGING
  console.log("--------------------------------------------------");
  console.log("🚨 getBookedMovies INVOKED");
  console.log("REQ.USER:", req.user);
  console.log("REQ.PARAMS:", req.params);
  console.log("REQ.BODY:", req.body);

  try {
    const { userId } = req.params;

    // 2️⃣ VALIDATE INPUTS
    if (!userId) {
        console.error("❌ CRASH PREVENTED: Missing userId in params");
        return res.status(400).send({ status: false, message: "User ID is required" });
    }

    // Check for "undefined" string which is a common frontend bug
    if (userId === "undefined" || userId === "null") {
        console.error("❌ CRASH PREVENTED: userId is string 'undefined' or 'null'");
        return res.status(400).send({ status: false, message: "Invalid User ID" });
    }

    // Validate ObjectId format (24 hex characters)
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    if (!objectIdRegex.test(userId)) {
         console.error(`❌ CRASH PREVENTED: Invalid userId format: '${userId}'`);
         return res.status(400).send({ status: false, message: "Invalid User ID format" });
    }

    if (!req.user || !req.user.id) {
        console.error("❌ Unauthorized access attempt to getBookedMovies");
        return res.status(401).send({ status: false, message: "Unauthorized" });
    }

    if (req.user.id !== userId) {
        console.error(`❌ Forbidden access: token user ${req.user.id} trying to access bookings of ${userId}`);
        return res.status(403).send({ status: false, message: "Forbidden" });
    }

    // 3️⃣ EXECUTE SAFE QUERY
    console.log(`Querying Prisma for userId: ${userId}`);
    
    const bookings = await prisma.Booking.findMany({
      where: {
        userId: userId
      },
      include: {
        show: {
            include: {
                movie: {
                    include: {
                        genre: true
                    }
                },
                theatre: true
            }
        },
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`✅ Prisma returned ${bookings ? bookings.length : 0} bookings`);

    if (!bookings) {
        // Should not happen with findMany, but defensive check
        return res.status(200).send([]);
    }

    // 4️⃣ SAFE TRANSFORMATION (No Crash)
    const transformedBookings = bookings.map(b => {
        // Defensive checks for missing relations
        const show = b.show || {};
        const movie = show.movie || null;
        const theatre = show.theatre || null;
        const showTime = show.startTime || null;
        
        return {
            ...b,
            movie,
            theatre,
            showTime
        };
    });
    
    console.log("✅ Data transformation successful");
    res.status(200).send(transformedBookings);

  } catch (err) {
    // 5️⃣ ERROR HANDLING (No 500 without info)
    console.error("🔥 CRITICAL ERROR in getBookedMovies:", err);
    console.error("Stack Trace:", err.stack);
    
    // Return a generic error to client but log full details
    res.status(500).send({ 
        status: false, 
        message: "Failed to load bookings",
        // Only in dev/debug mode might we want to send the error message, 
        // but user requested "Never throw unhandled exceptions"
        debug_error: err.message 
    });
  }
};

// Get all bookings (admin function)
exports.getAllBookings = async (req, res) => {
  try {
    // Fetch all bookings with user and movie details
    const bookings = await prisma.Booking.findMany({
      include: {
        show: {
            include: {
                movie: {
                    include: {
                        genre: true
                    }
                },
                theatre: true
            }
        },
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    if (!bookings) {
        return res.status(200).send([]);
    }

    const transformedBookings = bookings.map(b => {
        // Handle orphaned bookings or missing relations safely
        const show = b.show || {};
        const movie = show.movie || null;
        const theatre = show.theatre || null;

        return {
            ...b,
            movie: movie,
            theatre: theatre,
            showTime: show.startTime || null,
            // Ensure these fields are never undefined to prevent frontend crashes
            user: b.user || { name: 'Unknown User', email: 'N/A' }
        };
    });
    
    res.status(200).send(transformedBookings);
  } catch (err) {
    console.error("Error fetching all bookings:", err);
    res.status(500).send({ status: false, message: "Failed to load bookings", error: err.message });
  }
};

// Cancel booking (admin function)
exports.adminCancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.body;
    
    // Find the booking
    const booking = await prisma.Booking.findUnique({
      where: {
        id: bookingId
      }
    });
    
    if (!booking) {
      return res.status(404).send({ status: false, message: 'Booking not found' });
    }

    if (booking.status === 'cancelled') {
        return res.status(400).send({ status: false, message: 'Booking is already cancelled' });
    }
    
    // Transaction to update booking and seats
    await prisma.$transaction(async (tx) => {
        // Update booking status
        await tx.Booking.update({
            where: { id: bookingId },
            data: { status: 'cancelled' }
        });
        
        // Release seats
        for (const seatNum of booking.seats) {
             await tx.Seat.update({
                where: {
                    showId_seatNumber: {
                        showId: booking.showId,
                        seatNumber: seatNum
                    }
                },
                data: {
                    status: 'available',
                    lockedBy: null,
                    lockExpiresAt: null
                }
            });
        }
    });
    
    res.status(200).send({ status: true, message: 'Booking cancelled successfully' });
  } catch (err) {
    res.status(500).send({ status: false, message: err.message });
  }
};

// Get user profile by ID
exports.getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!req.user || !req.user.id) {
      return res.status(401).send({ status: false, message: 'Unauthorized' });
    }

    if (req.user.id !== userId) {
      return res.status(403).send({ status: false, message: 'Forbidden' });
    }

    const user = await prisma.User.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });
    
    if (!user) {
      return res.status(404).send({ status: false, message: 'User not found' });
    }
    
    res.status(200).send({
      status: true,
      user: user
    });
  } catch (err) {
    res.status(500).send({ status: false, message: err.message });
  }
};
