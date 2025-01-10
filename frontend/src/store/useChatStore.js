import axios from "axios";

import { create } from "zustand";
import toast from "react-hot-toast";
import { useAuthStore } from "./userAuthStore";
import { ReceiptEuro } from "lucide-react";

const baseUrl = import.meta.env.MODE === "development" ? "http://localhost:5000/api" : "https://chat-app-backend-mu-liard.vercel.app/api";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: true,
  isMessagesLoading: true,

  getUsers: async () => {
    try {
      set({ isUsersLoading: true });

      const res = await axios.get(`${baseUrl}/messages/users`, {
        withCredentials: true,
      });
      set({ users: res.data.data });
    } catch (error) {
      toast.error(error.response.data.messages);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    try {
      set({ isMessagesLoading: true });

      const res = await axios.get(`${baseUrl}/messages/message/${userId}`, {
        withCredentials: true,
      });
      set({ messages: res.data.data });
    } catch (error) {
      toast.error(error.response.data.messages);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  setSelectedUser: async (selectedUser) => set({ selectedUser: selectedUser }),

  sendMessage: async (data) => {
    for (let pair of data.entries()) {
      console.log(pair[0] + ": " + pair[1]);
    }

    try {
      const res = await axios.post(`${baseUrl}/messages/post-message`, data, {
        withCredentials: true,
      });

      console.log(res.data.data);

      // Update the state by appending new messages to the existing ones
      set((state) => ({
        messages: [...state.messages, res.data.data],
      }));
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.messages || "An error occurred");
    }
  },

  subscribeToMessages: () => {
    const { selectedUser, messages } = get();

    if (!selectedUser) return; // Ensure selectedUser exists before proceeding

    const socket = useAuthStore.getState().socket;

    if (socket && socket.connected) {
      socket.on("newMessage", (messageChecked) => {
        console.log("new", messageChecked);
        // Append the new message to the existing messages array

        if (messageChecked.senderId !== selectedUser._id) return

        set({ messages: [...messages, messageChecked] });
      });
    } else {
      console.log("Socket is not connected");
    }
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket
    socket.off("newMessage")
  },
}));
