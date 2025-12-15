import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import { getProfile, updateProfile } from "../services/auth";

export default function Profile() {
  const [profile, setProfile] = useState({ name: "", email: "" });
  const [success, setSuccess] = useState("");

  useEffect(() => {
    getProfile().then((res) => setProfile(res.data.data));
  }, []);

  const handleUpdate = async () => {
    await updateProfile(profile);
    setSuccess("Profile updated successfully!");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header title="Profile" />

      <main className="max-w-xl mx-auto p-6">
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">Your Profile</h2>

          {success && <div className="text-green-600 mb-4">{success}</div>}

          <input
            type="text"
            placeholder="Name"
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            className="w-full border px-4 py-2 rounded-lg mb-4"
          />

          <input
            type="email"
            placeholder="Email"
            value={profile.email}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            className="w-full border px-4 py-2 rounded-lg mb-6"
          />

          <button
            onClick={handleUpdate}
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition font-semibold"
          >
            Update Profile
          </button>
        </div>
      </main>
    </div>
  );
}
