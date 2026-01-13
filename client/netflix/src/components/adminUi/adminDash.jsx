import { Link } from "react-router-dom"
export default function AdminDash() { 
    return (
        <div className="min-h-screen bg-gray-100 text-gray-900 p-6">
            <div className="bg-gray-800 text-white p-4 rounded-lg shadow-md mb-6">
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Movie Management */}
                <div className="bg-white text-gray-900 p-6 rounded-lg shadow-md border border-gray-200">
                    <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Movie Management</h2>
                    <div className="flex flex-col gap-2">
                        <Link to="/add-movie" className="text-blue-600 hover:text-blue-800 font-medium hover:underline flex items-center">
                            <span className="mr-2">+</span> Add New Movie
                        </Link>
                        <Link to="/view-movie" className="text-blue-600 hover:text-blue-800 font-medium hover:underline flex items-center">
                            <span className="mr-2">•</span> View Movies
                        </Link>
                    </div>
                </div>

                {/* Genre Management */}
                <div className="bg-white text-gray-900 p-6 rounded-lg shadow-md border border-gray-200">
                    <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Genre Management</h2>
                    <div className="flex flex-col gap-2">
                        <Link to="/add-genre" className="text-blue-600 hover:text-blue-800 font-medium hover:underline flex items-center">
                            <span className="mr-2">+</span> Add New Genre
                        </Link>
                        <Link to="/add-genre" className="text-blue-600 hover:text-blue-800 font-medium hover:underline flex items-center">
                            <span className="mr-2">•</span> View Genre
                        </Link>
                    </div>
                </div>

                {/* Theatre Management */}
                <div className="bg-white text-gray-900 p-6 rounded-lg shadow-md border border-gray-200">
                    <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Theatre Management</h2>
                    <div className="flex flex-col gap-2">
                        <Link to="/admin/theatres" className="text-blue-600 hover:text-blue-800 font-medium hover:underline flex items-center">
                            <span className="mr-2">+</span> Manage Theatres
                        </Link>
                    </div>
                </div>

                {/* Show Management */}
                <div className="bg-white text-gray-900 p-6 rounded-lg shadow-md border border-gray-200">
                    <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Show Management</h2>
                    <div className="flex flex-col gap-2">
                        <Link to="/admin/shows" className="text-blue-600 hover:text-blue-800 font-medium hover:underline flex items-center">
                            <span className="mr-2">+</span> Manage Shows
                        </Link>
                    </div>
                </div>

                {/* Booking Management */}
                <div className="bg-white text-gray-900 p-6 rounded-lg shadow-md border border-gray-200">
                    <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Booking Management</h2>
                    <div className="flex flex-col gap-2">
                        <Link to="/admin/bookings" className="text-blue-600 hover:text-blue-800 font-medium hover:underline flex items-center">
                            <span className="mr-2">•</span> View All Bookings
                        </Link>
                    </div>
                </div>
            </div>  
        </div>
    )
}
