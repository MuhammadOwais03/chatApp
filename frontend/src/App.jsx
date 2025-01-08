
import React from 'react'
import Navbar from './components/Navbar'
import { Routes, Route } from 'react-router-dom'
import SignUpPage from './pages/SignUpPage'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import Settings from './pages/Settings'
import ProfilePage from './pages/ProfilePage'

const App = () => {
  return (
    <>

       <Navbar/>
       <Routes>
          <Route path='/home' element={<HomePage/>}/>
          <Route path='/signin' element={<SignUpPage/>}/>
          <Route path='/login' element={<LoginPage/>}/>
          <Route path='/settings' element={<Settings/>}/>
          <Route path='/profile' element={<ProfilePage/>}/>

       </Routes>
    </>
  )
}

export default App
