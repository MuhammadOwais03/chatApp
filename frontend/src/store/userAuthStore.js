
import axios from "axios";
import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const baseUrl = "https://chat-app-backend-mu-liard.vercel.app/api";
const backendUrl = "wss://chat-app-backend-mu-liard.vercel.app"


// const baseUrl = import.meta.env.MODE === "development" ? "http://localhost:5000/api" : "https://chat-app-backend-mu-liard.vercel.app/api";
// const backendUrl = import.meta.env.MODE === "development" ? "ws://localhost:5000" : "wss://chat-app-backend-mu-liard.vercel.app/"


console.log(backendUrl)


export const useAuthStore = create((set, get) => ({
    authUser: null,
    isCheckingAuth: true,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    onlineUsers: [],
    socket: null,

    checkAuth: async () => {
        // console.log(axiosInstance.defaults.baseURL);

        try {
            const res = await axios.get(`${baseUrl}/users/check`, { withCredentials: true });
            console.log(res.data.data);
            set({ authUser: res.data.data });
            get().connectSocket();
        } catch (error) {
            console.log(error);
            set({ authUser: null });
        } finally {
            set({ isCheckingAuth: false });
        }
    },

    signup: async (data) => {
        set({ isSigningUp: true });
        console.log("In signIn useAuth: ", data);
        try {
            const res = await axios.post(`${baseUrl}/users/register`, data, { withCredentials: true });
            console.log(res);
            set({ authUser: res.data.data });
            toast.success("Successfully Signed Up");
        } catch (error) {
            console.log(error);
            set({ authUser: false });
            toast.error(error.response.data.message);
        } finally {
            set({ isSigningUp: false });
        }
    },

    logOut: async () => {
        try {
            await axios.post(`${baseUrl}/users/logout`, {}, { withCredentials: true });
            set({ authUser: null });
            get().disconnectSocket();
            toast.success("Successfully Logged Out");
        } catch (error) {
            console.error(error);
            const errorMessage = error.response?.data?.message || "An error occurred while logging out.";
            toast.error(errorMessage);
        }
    },

    login: async (data) => {
        set({ isLoggingIn: true });
        console.log("In signIn useAuth: ", data);
        try {
            const res = await axios.post(`${baseUrl}/users/login`, data, { withCredentials: true });
            console.log(res);
            set({ authUser: res.data.data });
            get().connectSocket();
            toast.success("Successfully Signed In");
        } catch (error) {
            console.log(error);
            set({ authUser: false });
            toast.error(error.response.data.message);
        } finally {
            set({ isLoggingIn: false });
        }
    },

    updateProfile: async (formdata) => {
        set({ isUpdatingProfile: true });

        try {
            const res = await axios.post(`${baseUrl}/users/update-profile`, formdata, { withCredentials: true });
            set({ authUser: res.data.data });
            toast.success("Successfully uploaded the image");
        } catch (error) {
            console.log(error);
            toast.error(error.response.data.message);
        } finally {
            set({ isUpdatingProfile: false });
        }
    },

    connectSocket: () => {
        const { authUser } = get();
        if (!authUser || get().socket?.connected) return; // Avoid re-connecting

        const socket = io(backendUrl, {
            query: { userId: authUser._id },
            transports: ['websocket'],
            withCredentials: true, 
        });

        set({ socket: socket });

        console.log("connecting the socket")
        socket.connect();
        console.log("connecting the socket done")

        socket.on("getOnlineUsers", (userIds) => {
            set({ onlineUsers: userIds });
        });
    },

    disconnectSocket: () => {
        const socket = get().socket;
        if (socket && socket.connected) {
            socket.disconnect();
            console.log("Socket disconnected");
        } else {
            console.log("No active socket connection to disconnect");
        }
    },
}));
