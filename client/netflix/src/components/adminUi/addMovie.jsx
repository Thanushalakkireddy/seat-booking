import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

export default function AddMovie() {
    const [movieList,setMovieList]= useState([]);
    const [genreList,setGenreList]= useState([]);
    const [message,setMessage]= useState("");
    const navigate = useNavigate();
    const { id: editId } = useParams();
    useEffect(()=>{
        const fetchMovies= async()=>{
            try{
    const res = await axios.get("https://seat-booking-yfc8.onrender.com/api/admin/viewMovies",
    {headers:{Authorization:`Bearer ${localStorage.getItem('token')}`}});
            setMovieList(res.data.data);
            console.log(res.data.data);
            }catch(err){
                setMessage(err.message);
            }
        };fetchMovies();
    },[message])
    const [formData,setFormData]= useState({
        title:"",
        desc:"",
        year:"",
        url:"",
        bannerUrl:"",
        genreId:"",
        duration: "",
        language: "",
        releaseDate: ""
    });
    useEffect(()=>{
        const fetchGenres= async()=>{
            try{
    const res = await axios.get("https://seat-booking-yfc8.onrender.com/api/admin/viewGenre",
    {headers:{Authorization:`Bearer ${localStorage.getItem('token')}`}})
    setGenreList(res.data.data);
    console.log(res.data.data);
            }catch(err){
                setMessage(err.message);
            }
        };fetchGenres();
    },[])
    const handleChange=(e)=>{
        setFormData({...formData,[e.target.name]:e.target.value});
    }
    
    useEffect(() => {
        if (!editId || movieList.length === 0) return;

        const movie = movieList.find(m => m.id === editId);
        if (!movie) return;

        setFormData({
            title: movie.title || "",
            desc: movie.desc || "",
            year: movie.year ? String(movie.year) : "",
            url: movie.url || "",
            bannerUrl: movie.bannerUrl || "",
            genreId: movie.genreId || "",
            duration: movie.duration != null ? String(movie.duration) : "",
            language: movie.language || "",
            releaseDate: movie.releaseDate ? String(movie.releaseDate).slice(0, 10) : ""
        });
    }, [editId, movieList]);

    const handleSubmit= async()=>{
        // Basic Validation
        if(!formData.title || !formData.year || !formData.genreId || !formData.url || !formData.bannerUrl) {
            setMessage("Please fill in all required fields (Title, Year, Genre, URL, Banner)");
            return;
        }

        try{
            const payload = {
                ...formData,
                year: parseInt(formData.year),
                duration: formData.duration ? parseInt(formData.duration) : 120,
            };

            const tokenHeader = { headers:{Authorization:`Bearer ${localStorage.getItem('token')}`} };

            if (editId) {
                const editPayload = {
                    title: payload.title,
                    desc: payload.desc,
                    duration: payload.duration,
                    language: payload.language,
                    releaseDate: payload.releaseDate,
                    url: payload.url,
                    bannerUrl: payload.bannerUrl
                };
                const res = await axios.patch(
                    `https://seat-booking-yfc8.onrender.com/api/admin/editMovie/${editId}`,
                    editPayload,
                    tokenHeader
                );
                setMessage(res.data.message || "Movie updated successfully");
                navigate("/add-movie");
            } else {
                const res = await axios.post(
                    "https://seat-booking-yfc8.onrender.com/api/admin/addMovie",
                    payload,
                    tokenHeader
                );
                setMessage(res.data.message);
            }
        }catch(err){
            setMessage(err.response?.data?.message || err.message);
        }
    }
    const handleDelete= async(id)=>{
        // 1. Confirmation Dialog
        if (!window.confirm("Are you sure you want to delete this movie? This action cannot be undone.")) {
            return;
        }

        try{
            // 2. Call DELETE API
            const res = await axios.delete(`https://seat-booking-yfc8.onrender.com/api/admin/deleteMovie/${id}`,
            {headers:{Authorization:`Bearer ${localStorage.getItem('token')}`}})
            
            setMessage(res.data.message);

            // 3. Update UI (Remove movie from list)
            if(res.data.status){
                setMovieList(prevList => prevList.filter(movie => movie.id !== id));
            }
        }catch(err){
            console.error("Delete Error:", err);
            setMessage(err.response?.data?.message || err.message);
        }
    }

    const handleEdit = (id) => {
        navigate(`/edit-movie/${id}`);
    };
    //title,desc,year,url,bannerUrl,genreId
    return(
        <div className="min-h-screen bg-gray-100 text-gray-900 p-6">
            <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h1 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2">Add Movie</h1>
                <span className="text-red-500 font-medium block mb-4">{message}</span>
                <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <select name="genreId" onChange={handleChange} className="p-2 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="">Select Genre</option>
                            {genreList.map((e)=>(
                                  <option value={e.id} key={e.id}>{e.name}</option>
                            ))}
                        </select>
                        <input name="title" onChange={handleChange} type="text" placeholder="Title" className="p-2 border border-gray-300 rounded bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                        <input name="desc" onChange={handleChange} type="text" placeholder="Description" className="p-2 border border-gray-300 rounded bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                        <input name="year" onChange={handleChange} type="number" placeholder="Year" className="p-2 border border-gray-300 rounded bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                        <input name="duration" onChange={handleChange} type="number" placeholder="Duration (min)" className="p-2 border border-gray-300 rounded bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                        <input name="language" onChange={handleChange} type="text" placeholder="Language" className="p-2 border border-gray-300 rounded bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                        <input name="releaseDate" onChange={handleChange} type="date" placeholder="Release Date" className="p-2 border border-gray-300 rounded bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                        <input name="url" onChange={handleChange} type="text" placeholder="URL" className="p-2 border border-gray-300 rounded bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                        <input name="bannerUrl" onChange={handleChange} type="text" placeholder="Banner URL" className="p-2 border border-gray-300 rounded bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                    </div>
                   
                    <button onClick={handleSubmit}
                    type="submit" className="bg-red-500 text-white p-3 rounded font-bold hover:bg-red-600 transition duration-200 mt-2">Add Movie</button>
                </div>
            </div>

            <div className="mt-8 bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2">Movie List</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white text-gray-900 border border-gray-300">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="py-3 px-4 border-b border-gray-300 text-left font-semibold text-gray-700">Title</th>
                                <th className="py-3 px-4 border-b border-gray-300 text-left font-semibold text-gray-700">Description</th>
                                <th className="py-3 px-4 border-b border-gray-300 text-left font-semibold text-gray-700">Year</th>
                                <th className="py-3 px-4 border-b border-gray-300 text-left font-semibold text-gray-700">URL</th>
                                <th className="py-3 px-4 border-b border-gray-300 text-left font-semibold text-gray-700">Banner URL</th>
                                <th className="py-3 px-4 border-b border-gray-300 text-left font-semibold text-gray-700">Actions</th>
                            </tr>
                        </thead>
                    <tbody>
                        {movieList.map((movie)=>(
                            <tr key={movie.id}>
                                <td className="py-2 px-4 border-b border-gray-300">{movie.title}</td>
                                <td className="py-2 px-4 border-b border-gray-300">{movie.desc}</td>
                                <td className="py-2 px-4 border-b border-gray-300">{movie.year}</td>
                                <td className="py-2 px-4 border-b border-gray-300">
                                    <iframe width="100" height="100" src={movie.url} title={movie.title} frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                                </td>
                                <td className="py-2 px-4 border-b border-gray-300">
                                    <img src={movie.bannerUrl} alt={movie.title} className="w-32 h-auto" />
                                    </td>
                                <td className="py-2 px-4 border-b border-gray-300">
                                    <button
                                        onClick={() => handleEdit(movie.id)}
                                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2"
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        onClick={()=>{handleDelete(movie.id)}}
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
