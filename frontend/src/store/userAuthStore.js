import axios from "axios";
import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";


const baseUrl = 'http://localhost:5000/api'


export const useAuthStore = create((set)=>(
    {
        authUser: null,
        isCheckingAuth: true,
        isSigningUp: false,
        isLoggingIn: false,
        isUpdatingProfile: false,
        
        checkAuth: async () => {
            console.log(axiosInstance.defaults.baseURL);

            try {
                const res = await axios.get(`${baseUrl}/users/check`, { withCredentials: true });
                console.log(res.data.data);
                set({authUser: res.data.data})

            } catch (error) {
                console.log(error)
                set({authUser: null})
            }
            finally {
                set({isCheckingAuth: false})
            }
        },

        signup: async (data) => {
            set({isSigningUp: true})
            console.log("In signIn useAuth: ", data)
            try {
                const res = await axios.post(`${baseUrl}/users/register`, data, { withCredentials: true });
                console.log(res);
                set({authUser: res.data.data})
                toast.success("Succesfully Sign Up")

            } catch (error) {
                console.log(error)
                set({authUser: false})
                toast.error(error.response.data.message)
            }
            finally {
                set({isSigningUp: false})
            }
        },

        logOut: async () => {
            try {
                
                await axios.post(
                    `${baseUrl}/users/logout`, 
                    {}, 
                    { withCredentials: true } 
                );
        
                
                set({ authUser: null });
        
                
                toast.success("Successfully Logged Out");
            } catch (error) {
                console.error(error);
        
                
                const errorMessage = error.response?.data?.message || "An error occurred while logging out.";
                toast.error(errorMessage);
            } 
        },

        login: async (data) => {
            set({isLoggingIn: true})
            console.log("In signIn useAuth: ", data)
            try {
                const res = await axios.post(`${baseUrl}/users/login`, data, { withCredentials: true });
                console.log(res);
                set({authUser: res.data.data})
                toast.success("Succesfully Sign In")

            } catch (error) {
                console.log(error)
                set({authUser: false})
                toast.error(error.response.data.message)
            }
            finally {
                set({isLoggingIn: false})
            }
        },

        updateProfile: async (formdata) => {
            set({isUpdatingProfile: true})

            try {

                const res = await axios.post(`${baseUrl}/users/update-profile`, formdata, { withCredentials: true });
                set({authUser: res.data.data})
                toast.success("Successfully upload the image")

            } catch (error) {
                console.log(error)
                toast.error(error.response.data.message)

            } finally {
                set({isUpdatingProfile: false})
            }
        }
        
    }
))