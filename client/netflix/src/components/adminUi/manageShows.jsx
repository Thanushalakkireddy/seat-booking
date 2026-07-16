import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";



export default function ManageShows() {
    const [showList, setShowList] = useState([]);
    const [movieList, setMovieList] = useState([]);
    const [theatreList, setTheatreList] = useState([]);
    const [message, setMessage] = useState("");
    const [formData, setFormData] = useState({
        movieId: "",
        theatreId: "",
        startTime: ""
    });
    const navigate = useNavigate();
    const { id: editId } = useParams();

    const fetchShows = async () => {
        try {
            const res = await axios.get("http://localhost:8060/api/admin/viewShows",
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
            setShowList(res.data.data);
        } catch (err) {
            setMessage(err.message);
        }
    };

    const fetchMovies = async () => {
        try {
            const res = await axios.get("http://localhost:8060/api/admin/viewMovies",
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
            setMovieList(res.data.data);
        } catch (err) {
            setMessage(err.message);
        }
    };

    const fetchTheatres = async () => {
        try {
            const res = await axios.get("http://localhost:8060/api/admin/viewTheatre",
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
            setTheatreList(res.data.data);
        } catch (err) {
            setMessage(err.message);
        }
    };

    useEffect(() => {
        fetchShows();
        fetchMovies();
        fetchTheatres();
    }, [message]);

    useEffect(() => {
        if (!editId || showList.length === 0) return;
        const show = showList.find(s => s.id === editId);
        if (!show) return;

        const movieId = show.movieId || show.movie?.id || "";
        const theatreId = show.theatreId || show.theatre?.id || "";
        const startTime = show.startTime
            ? new Date(show.startTime).toISOString().slice(0, 16)
            : "";

        setFormData({
            movieId,
            theatreId,
            startTime
        });
    }, [editId, showList]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }

    const handleSubmit = async () => {
        if(!formData.movieId || !formData.theatreId || !formData.startTime) {
            setMessage("Please select Movie, Theatre and Start Time");
            return;
        }

        try {
            const headers = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };

            if (editId) {
                const res = await axios.patch(
                    `http://localhost:8060/api/admin/editShow/${editId}`,
                    formData,
                    headers
                );
                setMessage(res.data.message || "Show updated successfully");
                navigate("/admin/shows");
            } else {
                const res = await axios.post(
                    "http://localhost:8060/api/admin/addShow",
                    formData,
                    headers
                );
                setMessage(res.data.message);
            }
            fetchShows();
        } catch (err) {
            setMessage(err.response?.data?.message || err.message);
        }
    }

    const handleDelete = async (id) => {
        try {
            const res = await axios.delete(`http://localhost:8060/api/admin/deleteShow/${id}`,
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
            setMessage(res.data.message);
            fetchShows();
        } catch (err) {
            setMessage(err.message);
        }
    }

    const handleEdit = (id) => {
        navigate(`/admin/shows/${id}/edit`);
    };

    return (
        <div className="min-h-screen bg-gray-100 text-gray-900 p-6">
            <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h1 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2">Manage Shows</h1>
                <span className="text-red-500 font-medium block mb-4">{message}</span>
                <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <select name="movieId" onChange={handleChange} className="p-2 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="">Select Movie</option>
                            {movieList.map((e) => (
                                <option value={e.id} key={e.id}>{e.title}</option>
                            ))}
                        </select>

                        <select name="theatreId" onChange={handleChange} className="p-2 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="">Select Theatre</option>
                            {theatreList.map((e) => (
                                <option value={e.id} key={e.id}>{e.name} - {e.location}</option>
                            ))}
                        </select>

                        <input name="startTime" value={formData.startTime} onChange={handleChange} type="datetime-local" className="p-2 border border-gray-300 rounded bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>

                    <button onClick={handleSubmit} type="submit" className="bg-red-500 text-white p-3 rounded font-bold hover:bg-red-600 transition duration-200 mt-2">Add Show</button>
                </div>
            </div>

            <div className="mt-8 bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2">Show List</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white text-gray-900 border border-gray-300">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="py-3 px-4 border-b border-gray-300 text-left font-semibold text-gray-700">Movie</th>
                                <th className="py-3 px-4 border-b border-gray-300 text-left font-semibold text-gray-700">Theatre</th>
                                <th className="py-3 px-4 border-b border-gray-300 text-left font-semibold text-gray-700">Start Time</th>
                                <th className="py-3 px-4 border-b border-gray-300 text-left font-semibold text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {showList.map((show) => (
                                <tr key={show.id}>
                                    <td className="py-2 px-4 border-b border-gray-300">{show.movie?.title}</td>
                                    <td className="py-2 px-4 border-b border-gray-300">{show.theatre?.name}</td>
                                    <td className="py-2 px-4 border-b border-gray-300">{new Date(show.startTime).toLocaleString()}</td>
                                    <td className="py-2 px-4 border-b border-gray-300">
                                        <button
                                            onClick={() => handleEdit(show.id)}
                                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => { handleDelete(show.id) }}
                                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
