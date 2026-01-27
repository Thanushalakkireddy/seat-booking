import axios from "axios";
import { useState } from "react";

export default function Register() {
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState("");
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

    if (showOtpInput) {
      if (!otp) {
        setMessage("Please enter the OTP.");
        return;
      }
      try {
        const response = await axios.post(
          `http://localhost:8060/api/${formData.role}/verify-otp`,
          {
            email: formData.email,
            otp: otp
          }
        );
        if (response.status === 200) {
           setMessage("✅ Verification Successful! You can now login.");
           localStorage.setItem("token", response.data.token);
           // Optional: Navigate to dashboard or login. 
           // For now, let's reset form or leave it as is.
           setFormData({ username: "", email: "", pass: "", role: "user" });
           setShowOtpInput(false);
           setOtp("");
        }
      } catch (err) {
        setMessage(`❌ ${err.response?.data?.message || err.message}`);
      }
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:8060/api/${formData.role}/register`,
        {
          name: formData.username,
          email: formData.email,
          pass: formData.pass,
          role: formData.role, // Include role in the request
        }
      );

      if (response.data.status) {
        setMessage("✅ OTP Sent! Please check your email.");
        setShowOtpInput(true);
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
          {!showOtpInput ? (
            <>
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
            </>
          ) : (
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 6-digit OTP"
              className="w-full mb-6 px-3 py-2 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600"
            />
          )}
          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-md"
          >
            {showOtpInput ? "Verify OTP & Complete Registration" : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
}
