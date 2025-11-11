import { createBrowserRouter } from 'react-router-dom'
import HomePage from '../pages/Mainpage'
import RegisterPage from '../pages/RegisterPage'
import MainpageLogin from '../pages/MainpageLogin'
import MyPage from '../pages/MyPage'
import CustomerSupportPage from '../pages/CustomerSupportPage'
import BackgroundLayout from '../Layout/BackgroundLayout'
import PopularPage from '../pages/PopularPage'
import AIRecommendPage from '../pages/AIRecommendPage'
import ScrapEventsPage from '../pages/ScrapEventsPage'
import TermsPage from '../pages/TermsPage'
import DeleteAccountPage from '../pages/DeleteAccountPage'


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
  { path: '/ai', element: <AIRecommendPage /> },
  { path: '/popular', element: <PopularPage /> },
      { path: '/scrap', element: <ScrapEventsPage /> },
      { path: '/term', element: <TermsPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/delete', element: <DeleteAccountPage /> },

])