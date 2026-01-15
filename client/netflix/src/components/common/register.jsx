import axios from "axios";
import { useState } from "react";

export default function Register() {
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    pass: "",
    role: "user", // default to user
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRoleChange = (e) => {
    setFormData({
      ...formData,
      role: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();  // Prevent page reload

    if (!formData.username || !formData.email || !formData.pass) {
      setMessage("All fields are required.");
      return;
    }

    try {
      const response = await axios.post(
        `https://seat-booking-yfc8.onrender.com/api/${formData.role}/register`,
        {
          name: formData.username,
          email: formData.email,
          pass: formData.pass,
          role: formData.role, // Include role in the request
        }
      );

      if (response.data.status) {
        setMessage("✅ Registration Successful! Please Log In.");
        setFormData({ username: "", email: "", pass: "" }); // Clear fields
      } else {
        setMessage(`❌ ${response.data.message}`);
      }
    } catch (err) {
      setMessage(`❌ ${err.response?.data?.message || err.message}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-white text-center">Register</h2>
        {message && (
          <span className="text-white mb-4 text-center block">{message}</span>
        )}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Username"
            className="w-full mb-4 px-3 py-2 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600"
          />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            className="w-full mb-4 px-3 py-2 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600"
          />
          <input
            type="password"
            name="pass"
            value={formData.pass}
            onChange={handleChange}
            placeholder="Password"
            className="w-full mb-6 px-3 py-2 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600"
          />
          <select
            value={formData.role}
            onChange={handleRoleChange}
            className="w-full mb-4 px-3 py-2 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-md"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
}
