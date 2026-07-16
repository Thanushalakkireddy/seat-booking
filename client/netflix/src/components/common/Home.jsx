import { Link } from 'react-router-dom';
import bg from '../../assets/bg.jpg';

export default function Home() {
  // Sample movie data (since we don't want to modify backend)
  const featuredMovies = [
    {
      id: 1,
      title: 'Inception',
      genre: 'Sci-Fi',
      image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=300&h=450&fit=crop',
    },
    {
      id: 2,
      title: 'The Dark Knight',
      genre: 'Action',
      image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=300&h=450&fit=crop',
    },
    {
      id: 3,
      title: 'Interstellar',
      genre: 'Adventure',
      image: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=300&h=450&fit=crop',
    },
    {
      id: 4,
      title: 'Parasite',
      genre: 'Thriller',
      image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300&h=450&fit=crop',
    },
  ];

  const theatres = [
    {
      id: 1,
      name: 'Cineplex Downtown',
      location: '123 Main St, City Center',
      seats: 150,
    },
    {
      id: 2,
      name: 'Galaxy Cinemas',
      location: '456 Park Ave, West End',
      seats: 200,
    },
    {
      id: 3,
      name: 'Metro Theater',
      location: '789 Oak St, East Side',
      seats: 120,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Hero Section */}
      <section
        className="relative h-[80vh] bg-cover bg-center flex items-center justify-center"
        style={{ backgroundImage: `url(${bg})` }}
      >
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative z-10 text-center px-4">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
            Book My Show
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-2xl mx-auto">
            Experience the magic of cinema. Book your tickets now for the latest movies!
          </p>
          <Link
            to="/signin"
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-4 px-10 rounded-lg text-lg transition-all duration-300 transform hover:scale-105"
          >
            Sign In Now
          </Link>
        </div>
      </section>

      {/* Featured Movies Section */}
      <section className="py-16 px-4 md:px-8 bg-gray-800">
        <h2 className="text-4xl font-bold mb-10 text-center text-red-500">Featured Movies</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {featuredMovies.map((movie) => (
            <div
              key={movie.id}
              className="bg-gray-700 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <img
                src={movie.image}
                alt={movie.title}
                className="w-full h-64 object-cover"
              />
              <div className="p-5">
                <h3 className="text-xl font-semibold mb-2">{movie.title}</h3>
                <p className="text-gray-400">{movie.genre}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Theatres Section */}
      <section className="py-16 px-4 md:px-8">
        <h2 className="text-4xl font-bold mb-10 text-center text-red-500">Featured Theatres</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {theatres.map((theatre) => (
            <div
              key={theatre.id}
              className="bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              <h3 className="text-2xl font-semibold mb-3">{theatre.name}</h3>
              <p className="text-gray-400 mb-2"><span className="font-medium">Location:</span> {theatre.location}</p>
              <p className="text-gray-400"><span className="font-medium">Seats:</span> {theatre.seats}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 px-4 md:px-8 bg-gradient-to-r from-gray-800 to-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Book Tickets Easily</h2>
          <p className="text-xl text-gray-300 mb-10">
            With Book My Show, you can browse movies, select your seats, and book tickets in just a few clicks!
          </p>
          <Link
            to="/signin"
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-4 px-10 rounded-lg text-lg transition-all duration-300 transform hover:scale-105"
          >
            Get Started
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black py-10 px-4 md:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h3 className="text-2xl font-bold text-red-500 mb-4">Book My Show</h3>
          <p className="text-gray-400 mb-6">© 2025 Book My Show. All rights reserved.</p>
          <div className="flex justify-center gap-6 text-gray-400">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
