
import axios from 'axios';


import {create} from 'zustand';
import toast from 'react-hot-toast';


const baseUrl = 'http://localhost:5000/api'

export const useChatStore = create((set) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: true,
    isMessagesLoading: true,
  
    getUsers: async () => {
            try {
                set({isUsersLoading: true})

                const res = await axios.get(`${baseUrl}/messages/users`, { withCredentials: true })
                set({users: res.data.data})
                

            } 
            catch (error) {
                toast.error(error.response.data.messages)
            }
            finally {
                set({isUsersLoading: false})
            }
    },

    getMessages: async (userId) => {
        try {
            set({isMessagesLoading: true})

            const res = await axios.get(`${baseUrl}/messages/message/${userId}`, { withCredentials: true })
            set({messages: res.data.data})


        } catch(error) {
            toast.error(error.response.data.messages)
        }

        finally {
            set({isMessagesLoading: false})
        }
    },

    setSelectedUser: async (selectedUser) => set({selectedUser: selectedUser})

}));
