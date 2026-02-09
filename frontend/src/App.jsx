import React from 'react'
import { Button } from './components/ui/button';
import { createBrowserRouter,RouterProvider} from 'react-router-dom';
import Home from './pages/Home';
import Navbar from './components/Navbar'
import Signup from './pages/Signup';
import Login from './pages/Login';
import Verify from './pages/Verify';
import VerifyEmail from './pages/VerifyEmail';

const router = createBrowserRouter([
  {
    path:'/',
    element:<><Navbar/><Home/></>
  },
  {
    path:'/signup',
    element:<><Signup/></>
  },
  {
    path:'/login',
    element:<><Login/></>
  },
  {
    path:'/verify',
    element:<><Verify/></>
  },
  {
    path:'/verify/:token',
    element:<><VerifyEmail/></>
  }
])

const App = () => {
  return (
    <>
    <RouterProvider router = {router}/>
    
    </>
    
  )
}

export default App