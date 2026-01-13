import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
export default function AddGenre() {
  const [genreName, setGenreName] = useState("");
  const [message, setMessage] = useState("");
  const [genreList, setGenreList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [update, SetUpdate] = useState(-1);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(
          "http://localhost:8060/api/admin/viewGenre",
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        setGenreList(res.data.data);
        setTimeout(() => {
          setMessage("");
        }, 1000);
      } catch (err) {
        setMessage(err.message);
      }
    };
    fetchData();
  }, [message]);
  const handleAddGenre = async () => {
    console.log(genreName);
    try {
      let res;
      if (update!== -1) {
        //update genre
        res = await axios.patch(
          `http://localhost:8060/api/admin/genre/${genreList[update].id}`,
          { name: genreName },
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
      } else {
        //add genre
        res = await axios.post(
          "http://localhost:8060/api/admin/genre",
          { name: genreName },
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
      }
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.message);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    const filteredGenres = genreList.sort((genre) =>
      genre.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setGenreList(filteredGenres.reverse());
  };
  const handleDelete = async (id) => {
    let res;
    try {
      // eslint-disable-next-line no-unused-vars
      res = axios.delete(
        `http://localhost:8060/api/admin/genreDelete/${id}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setMessage("Deleted Successfully");
    } catch (err) {
      setMessage(err.message);
    }
  };
  const handleEdit = async (index) => {
    setGenreName(genreList[index].name);
    SetUpdate(index);
  };
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 p-6">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h1 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2">Add Genre</h1>
        <span className="text-red-500 font-medium block mb-4">{message}</span>
        <div className="flex gap-4">
          <input
            type="text"
            value={genreName}
            onChange={(e) => {
              setGenreName(e.target.value);
            }}
            placeholder="Genre Name"
            className="flex-1 border border-gray-300 p-2 rounded text-gray-900 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleAddGenre}
            className="bg-red-500 text-white px-6 py-2 rounded font-bold hover:bg-red-600 transition duration-200"
          >
            {update !== -1 ? "Update Genre" : " Add Genre"}
          </button>
        </div>
      </div>
      
      <div className="mt-8 bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Existing Genres</h2>
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Search Genre"
          className="border p-2 rounded mb-4 w-full"
        />

        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">ID</th>
              <th className="py-2 px-4 border-b">Genre Name</th>
              <th className="py-2 px-4 border-b">Action</th>
            </tr>
          </thead>
          <tbody>
            {genreList.map((genre, index) => (
              <tr key={genre.id}>
                <td className="py-2 px-4 border-b">{index + 1}</td>
                <td className="py-2 px-4 border-b">{genre.name}</td>
                <td className="py-2 px-4 border-b">
                  <button
                    className="bg-red-500 text-white px-2 py-1 rounded"
                    onClick={() => {
                      handleDelete(genre.id);
                    }}
                  >
                    Delete
                  </button>
                  <button
                    className="bg-blue-500 text-white px-2 py-1 rounded ml-2"
                    onClick={() => {
                      handleEdit(index);
                    }}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
