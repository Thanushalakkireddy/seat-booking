import { Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/common/ErrorBoundary';
import Header from './components/common/header';
import MainContent from './components/common/mainContent';
import Register from './components/common/register';
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
          <Route path="/" element={<MainContent />} />
          <Route path="/admin-dashboard" element={<AdminDash />} />
          <Route path="/admin/bookings" element={<AdminBookings />} />
          <Route path="/admin/theatres" element={<ManageTheatres />} />
          <Route path="/admin/theatres/:id/edit" element={<ManageTheatres />} />
          <Route path="/admin/shows" element={<ManageShows />} />
          <Route path="/admin/shows/:id/edit" element={<ManageShows />} />
          <Route path="/user-dashboard" element={<UserDash />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/booking/:bookingId" element={<BookingConfirmation />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/seats/:id" element={<SeatSelection />} />
          <Route path="/signup" element={<Register />} />
          <Route path="/add-movie" element={<AddMovie />} />
          <Route path="/edit-movie/:id" element={<AddMovie />} />
          <Route path="/add-genre" element={<AddGenre />} />
          <Route path="/view-movie" element={<ViewMovies />} />
          <Route path="/watch/:id" element={<WatchMovie />} />
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
