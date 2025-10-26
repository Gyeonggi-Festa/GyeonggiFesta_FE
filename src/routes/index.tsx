import { createBrowserRouter } from 'react-router-dom'
import HomePage from '../pages/Mainpage'
import RegisterPage from '../pages/RegisterPage'
import MainpageLogin from '../pages/MainpageLogin'
import MyPage from '../pages/MyPage'
import CustomerSupportPage from '../pages/CustomerSupportPage'
import BackgroundLayout from '../Layout/BackgroundLayout'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <BackgroundLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      {
        path: '/support',
        element: <CustomerSupportPage />,
      }
      
    ],
    
  },
  { path: '/mypage', element: <MyPage /> },
  { path: '/mainpage', element: <MainpageLogin /> },
  { path: '/register', element: <RegisterPage /> },
])