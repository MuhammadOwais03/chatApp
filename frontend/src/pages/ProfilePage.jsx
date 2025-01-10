import React, { useState, useEffect } from "react";
import { useAuthStore } from "../store/userAuthStore";
import avatar from "../../public/avatar.png";
import { Camera, User, Mail } from "lucide-react";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();

  console.log(authUser)

  const [profileImg, setProfileImg] = useState(null);
  const [email, setEmail] = useState(authUser?.email);
  const [fullName, setFullName] = useState(authUser?.fullName);

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log(file)
      setProfileImg(file);
    }
  };

  const handleImageUpload = async (event) => {
    event.preventDefault();
    handleUpload(event);

    const formData = new FormData();
    formData.append("fullName", null);
    formData.append("email", null);
    formData.append("profilePic", profileImg);

    // Log the FormData content to see what is being appended
    for (let pair of formData.entries()) {
      console.log(pair[0] + ": " + pair[1]);
    }

    // Call updateProfile with formData
    updateProfile(formData);
  };

  useEffect(() => {
    if (profileImg) {
      const formData = new FormData();
      formData.append("profilePic", profileImg);
      // Update the profile picture in the backend if necessary
      updateProfile(formData);
    }
  }, [profileImg]);

  return (
    <div className="h-screen pt-20">
      <div className="max-w-2xl mx-auto p-4 py-6">
        <div className="rounded-xl p-6 space-y-8 ">
          <div className="text-center">
            <h1 className="text-2xl font-semibold ">Profile</h1>
            <p className="mt-2">Your profile information</p>
          </div>

          {/* Profile pic upload */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={profileImg ? URL.createObjectURL(profileImg) : authUser.profilePic || avatar}
                alt="Profile"
                className="size-32 rounded-full object-cover border-4"
              />
              <label
                htmlFor="avatar-upload"
                className={`absolute bottom-0 right-0 bg-base-content hover:scale-105 p-2 rounded-full cursor-pointer transition-all duration-200 ${
                  isUpdatingProfile ? "animate-pulse pointer-events-none" : ""
                }`}
              >
                <Camera className="w-5 h-5 text-base-200" />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUpdatingProfile}
                />
              </label>
            </div>
            <p className="text-sm ">
              {isUpdatingProfile ? "Uploading..." : "Click the camera icon to update your photo"}
            </p>

            <div className="space-y-6 w-full">
              <div className="space-y-1.5 w-full">
                <div className="text-sm  flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Full Name
                </div>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="px-4 py-2.5 bg-base-200 rounded-lg border w-full"
                />
              </div>

              <div className="space-y-1.5 w-full">
                <div className="text-sm  flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="px-4 py-2.5 bg-base-200 rounded-lg border w-full"
                />
              </div>
            </div>

            <div className="mt-6 bg-base-300 rounded-xl p-6 w-full">
              <h2 className="text-lg font-medium mb-4">Account Information</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between py-2 border-b border-zinc-700">
                  <span>Member Since</span>
                  <span>{authUser?.createdAt?.split("T")[0]}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span>Account Status</span>
                  <span className="text-green-500">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
