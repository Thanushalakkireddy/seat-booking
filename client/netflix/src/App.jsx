import { Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/common/ErrorBoundary';
import Header from './components/common/header';
import MainContent from './components/common/mainContent';
import Register from './components/common/register';
import Home from './components/common/Home';
import ProtectedRoute from './components/common/ProtectedRoute';
import GuestRoute from './components/common/GuestRoute';
import AdminDash from './components/adminUi/adminDash';
import AddMovie from './components/adminUi/addMovie';
import AddGenre from './components/adminUi/addGenre';
import ViewMovies from './components/userUI/viewMovies';
import WatchMovie from './components/userUI/watchMovie';
import UserDash from './components/userUI/userDash';
import Bookings from './components/userUI/bookings';
import SeatSelection from './components/userUI/seatSelection';
import AdminBookings from './components/adminUi/adminBookings';
import ManageTheatres from './components/adminUi/manageTheatres';
import ManageShows from './components/adminUi/manageShows';
import Profile from './components/userUI/profile';
import BookingConfirmation from './components/userUI/bookingConfirmation';

function App() {
  console.log("App is rendering...");
  return (
    <ErrorBoundary>
      {/* Inline styles to ensure visibility even if CSS fails */}
      <div style={{ minHeight: '100vh', backgroundColor: '#000', color: '#fff' }} className="app-container min-h-screen bg-black text-white">
        <Header />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />

          {/* Guest Routes (only for unauthenticated users) */}
          <Route path="/signin" element={
            <GuestRoute><MainContent /></GuestRoute>
          } />
          <Route path="/signup" element={
            <GuestRoute><Register /></GuestRoute>
          } />

          {/* Protected Routes */}
          <Route path="/admin-dashboard" element={
            <ProtectedRoute><AdminDash /></ProtectedRoute>
          } />
          <Route path="/admin/bookings" element={
            <ProtectedRoute><AdminBookings /></ProtectedRoute>
          } />
          <Route path="/admin/theatres" element={
            <ProtectedRoute><ManageTheatres /></ProtectedRoute>
          } />
          <Route path="/admin/theatres/:id/edit" element={
            <ProtectedRoute><ManageTheatres /></ProtectedRoute>
          } />
          <Route path="/admin/shows" element={
            <ProtectedRoute><ManageShows /></ProtectedRoute>
          } />
          <Route path="/admin/shows/:id/edit" element={
            <ProtectedRoute><ManageShows /></ProtectedRoute>
          } />
          <Route path="/user-dashboard" element={
            <ProtectedRoute><UserDash /></ProtectedRoute>
          } />
          <Route path="/bookings" element={
            <ProtectedRoute><Bookings /></ProtectedRoute>
          } />
          <Route path="/booking/:bookingId" element={
            <ProtectedRoute><BookingConfirmation /></ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute><Profile /></ProtectedRoute>
          } />
          <Route path="/seats/:id" element={
            <ProtectedRoute><SeatSelection /></ProtectedRoute>
          } />
          <Route path="/add-movie" element={
            <ProtectedRoute><AddMovie /></ProtectedRoute>
          } />
          <Route path="/edit-movie/:id" element={
            <ProtectedRoute><AddMovie /></ProtectedRoute>
          } />
          <Route path="/add-genre" element={
            <ProtectedRoute><AddGenre /></ProtectedRoute>
          } />
          <Route path="/view-movie" element={
            <ProtectedRoute><ViewMovies /></ProtectedRoute>
          } />
          <Route path="/watch/:id" element={
            <ProtectedRoute><WatchMovie /></ProtectedRoute>
          } />

          {/* Fallback route for 404 */}
          <Route path="*" element={
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-red-500 mb-4">404</h1>
                <p className="text-xl">Page Not Found</p>
                <p className="text-gray-500 mt-2">The requested URL was not found.</p>
              </div>
            </div>
          } />
        </Routes>
      </div>
    </ErrorBoundary>
  );
}

export default App;
