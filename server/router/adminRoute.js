const express = require('express')
const router = express.Router()
const authController = require('../controller/authController')
const adminController = require('../controller/adminController')
const userController = require('../controller/userController')
const authenticateMiddleware = require('../middleware/authenticateMiddleware');
const {verifyAdmin} = authenticateMiddleware;

const {adminLogin,adminRegister,adminChangePass} = authController;
const {
    getAllUsers,
    addGenre,
    editGenre,
    deleteGenre,
    viewGenre,
    addMovie,
    viewMovies,
    editMovies,
    deleteMovie,
    addTheatre,
    viewTheatre,
    editTheatre,
    deleteTheatre,
    addShow,
    viewShows,
    editShow,
    deleteShow
} = adminController;
const {getAllBookings, adminCancelBooking} = userController;

// Public routes
router.post('/register',adminRegister);
router.post('/login',adminLogin);

// Protected routes
router.use(verifyAdmin); // Apply to all subsequent routes

// User Management
router.get('/allUsers',getAllUsers);
router.put('/changePass/:id',adminChangePass);

// Genre Management
router.post('/genre',addGenre);
router.get('/viewGenre',viewGenre)
router.patch('/genre/:id',editGenre);
router.delete('/genreDelete/:id',deleteGenre);

// Movie Management
router.post('/addMovie',addMovie)
router.get('/viewMovies',viewMovies)
router.patch('/editMovie/:id',editMovies);
router.delete('/deleteMovie/:id',deleteMovie)

// Theatre Management
router.post('/addTheatre', addTheatre);
router.get('/viewTheatre', viewTheatre);
router.patch('/editTheatre/:id', editTheatre);
router.delete('/deleteTheatre/:id', deleteTheatre);

// Show Management
router.post('/addShow', addShow);
router.get('/viewShows', viewShows);
router.patch('/editShow/:id', editShow);
router.delete('/deleteShow/:id', deleteShow);

// Booking Management
router.get('/all-bookings', getAllBookings);
router.post('/cancel-booking', adminCancelBooking);

module.exports = router;
