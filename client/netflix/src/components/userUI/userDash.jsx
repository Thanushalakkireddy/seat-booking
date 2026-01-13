import { Link } from "react-router-dom";

export default function UserDash() {
    return (
        <div className="min-h-screen bg-gray-900 p-6 text-gray-100">
            {/* Header */}
            <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
                <h1 className="text-3xl font-extrabold tracking-wide text-indigo-400">
                    🎬 User Dashboard
                </h1>
                <p className="text-sm text-gray-400 mt-1">
                    Manage your movies, bookings, and account in one place.
                </p>
            </div>

            {/* Cards Section */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Movie Library */}
                <div className="bg-gray-800 rounded-xl shadow-lg p-6 hover:bg-gray-700 transition duration-300 border border-gray-700">
                    <div className="text-4xl text-indigo-400 mb-3">🎬</div>
                    <h2 className="text-xl font-semibold mb-2">Movie Library</h2>
                    <p className="text-gray-400 mb-4">Browse and explore the latest movies.</p>
                    <Link 
                        to="/view-movie" 
                        className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                    >
                        Browse Movies
                    </Link>
                </div>

                {/* Account */}
                <div className="bg-gray-800 rounded-xl shadow-lg p-6 hover:bg-gray-700 transition duration-300 border border-gray-700">
                    <div className="text-4xl text-purple-400 mb-3">👤</div>
                    <h2 className="text-xl font-semibold mb-2">Account</h2>
                    <p className="text-gray-400 mb-4">View and update your profile details.</p>
                    <Link 
                        to="/profile" 
                        className="inline-block bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
                    >
                        View Profile
                    </Link>
                </div>

                {/* Bookings */}
                <div className="bg-gray-800 rounded-xl shadow-lg p-6 hover:bg-gray-700 transition duration-300 border border-gray-700">
                    <div className="text-4xl text-pink-400 mb-3">🎟️</div>
                    <h2 className="text-xl font-semibold mb-2">My Bookings</h2>
                    <p className="text-gray-400 mb-4">Check your booked movie tickets.</p>
                    <Link 
                        to="/bookings" 
                        className="inline-block bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition"
                    >
                        View Bookings
                    </Link>
                </div>
            </div>
        </div>
    );
}
