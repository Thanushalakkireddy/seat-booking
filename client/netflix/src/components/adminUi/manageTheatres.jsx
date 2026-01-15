import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

export default function ManageTheatres() {
    const [theatreList, setTheatreList] = useState([]);
    const [message, setMessage] = useState("");
    const [formData, setFormData] = useState({
        name: "",
        location: "",
        totalSeats: "",
        rows: "",
        cols: ""
    });
    const navigate = useNavigate();
    const { id: editId } = useParams();

    const fetchTheatres = async () => {
        try {
            const res = await axios.get("https://seat-booking-yfc8.onrender.com/api/admin/viewTheatre",
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
            setTheatreList(res.data.data);
        } catch (err) {
            setMessage(err.message);
        }
    };

    useEffect(() => {
        fetchTheatres();
    }, [message]);

    useEffect(() => {
        if (!editId || theatreList.length === 0) return;
        const theatre = theatreList.find(t => t.id === editId);
        if (!theatre) return;
        setFormData({
            name: theatre.name || "",
            location: theatre.location || "",
            totalSeats: theatre.totalSeats != null ? String(theatre.totalSeats) : "",
            rows: theatre.rows != null ? String(theatre.rows) : "",
            cols: theatre.cols != null ? String(theatre.cols) : ""
        });
    }, [editId, theatreList]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }

    const handleSubmit = async () => {
        if(!formData.name || !formData.location) {
            setMessage("Name and Location are required");
            return;
        }

        try {
            const payload = {
                ...formData,
                totalSeats: formData.totalSeats ? parseInt(formData.totalSeats) : undefined,
                rows: formData.rows ? parseInt(formData.rows) : undefined,
                cols: formData.cols ? parseInt(formData.cols) : undefined
            };

            const headers = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };

            if (editId) {
                const res = await axios.patch(
                    `https://seat-booking-yfc8.onrender.com/api/admin/editTheatre/${editId}`,
                    payload,
                    headers
                );
                setMessage(res.data.message || "Theatre updated successfully");
                navigate("/admin/theatres");
            } else {
                const res = await axios.post(
                    "https://seat-booking-yfc8.onrender.com/api/admin/addTheatre",
                    payload,
                    headers
                );
                setMessage(res.data.message);
            }
            fetchTheatres();
        } catch (err) {
            setMessage(err.response?.data?.message || err.message);
        }
    }

    const handleDelete = async (id) => {
        try {
            const res = await axios.delete(`https://seat-booking-yfc8.onrender.com/api/admin/deleteTheatre/${id}`,
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
            setMessage(res.data.message);
            fetchTheatres();
        } catch (err) {
            setMessage(err.message);
        }
    }

    const handleEdit = (id) => {
        navigate(`/admin/theatres/${id}/edit`);
    };

    return (
        <div className="min-h-screen bg-gray-100 text-gray-900 p-6">
            <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h1 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2">Manage Theatres</h1>
                <span className="text-red-500 font-medium block mb-4">{message}</span>
                <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input name="name" onChange={handleChange} type="text" placeholder="Theatre Name" className="p-2 border border-gray-300 rounded bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        <input name="location" onChange={handleChange} type="text" placeholder="Location" className="p-2 border border-gray-300 rounded bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        <input name="totalSeats" onChange={handleChange} type="number" placeholder="Total Seats" className="p-2 border border-gray-300 rounded bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        <input name="rows" onChange={handleChange} type="number" placeholder="Rows" className="p-2 border border-gray-300 rounded bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        <input name="cols" onChange={handleChange} type="number" placeholder="Columns" className="p-2 border border-gray-300 rounded bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>

                    <button onClick={handleSubmit}
                        type="submit" className="bg-red-500 text-white p-3 rounded font-bold hover:bg-red-600 transition duration-200 mt-2">Add Theatre</button>
                </div>
            </div>

            <div className="mt-8 bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2">Theatre List</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white text-gray-900 border border-gray-300">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="py-3 px-4 border-b border-gray-300 text-left font-semibold text-gray-700">Name</th>
                                <th className="py-3 px-4 border-b border-gray-300 text-left font-semibold text-gray-700">Location</th>
                                <th className="py-3 px-4 border-b border-gray-300 text-left font-semibold text-gray-700">Seats</th>
                                <th className="py-3 px-4 border-b border-gray-300 text-left font-semibold text-gray-700">Layout (RxC)</th>
                                <th className="py-3 px-4 border-b border-gray-300 text-left font-semibold text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {theatreList.map((theatre) => (
                                <tr key={theatre.id}>
                                    <td className="py-2 px-4 border-b border-gray-300">{theatre.name}</td>
                                    <td className="py-2 px-4 border-b border-gray-300">{theatre.location}</td>
                                    <td className="py-2 px-4 border-b border-gray-300">{theatre.totalSeats}</td>
                                    <td className="py-2 px-4 border-b border-gray-300">{theatre.rows}x{theatre.cols}</td>
                                    <td className="py-2 px-4 border-b border-gray-300">
                                        <button
                                            onClick={() => handleEdit(theatre.id)}
                                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => { handleDelete(theatre.id) }}
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
