const express = require('express')
const router = express.Router()
const authController = require('../controller/authController')
const userController = require('../controller/userController')
const { verifyUser } = require('../middleware/authenticateMiddleware')
const {userRegister,userLogin, userLogout} = authController;
const {viewAllMovies, viewAllGenre, viewMoviesByGenre, viewMovieById, rateMovie, searchMovies, bookMovie, createTempBooking, getBookedSeats, cancelTempBooking, cancelConfirmedBooking, getBookedMovies, getUserProfile, getShowsByMovie, getBookingById} = userController;

router.post('/register',userRegister);
router.post('/login',userLogin);
router.post('/logout', verifyUser, userLogout);
router.get('/viewAllMovies', viewAllMovies);
router.get('/viewAllGenre', viewAllGenre);
router.get('/movies/:genre', viewMoviesByGenre);
router.get('/viewMovie/:id', viewMovieById);
router.get('/shows/:movieId', getShowsByMovie); // New route for fetching shows
router.post('/rating', verifyUser, rateMovie);
router.get('/search', searchMovies);
router.post('/book', verifyUser, bookMovie);
router.post('/temp-booking', verifyUser, createTempBooking);
router.get('/booked-seats/:showId', getBookedSeats); // Updated to use showId
router.post('/cancel-booking', verifyUser, cancelTempBooking);
router.post('/cancel-confirmed-booking', verifyUser, cancelConfirmedBooking);
router.get('/booking/:bookingId', verifyUser, getBookingById);
router.get('/booked/:userId', verifyUser, getBookedMovies);
router.get('/profile/:userId', verifyUser, getUserProfile);

module.exports = router;
