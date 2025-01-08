import { create } from "zustand";


export const useAuthStore = create((set)=>(
    {
        authUser: null,
        isCheckingAuth: true,
        isSigningUp: false,
        isLoggingUp: false,
        isUpdatingProfile: false,
    }
))