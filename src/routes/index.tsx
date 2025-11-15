import { createBrowserRouter } from 'react-router-dom'
import HomePage from '../pages/Mainpage'
import CreateGroupChat from '../pages/CreateGroupChat'
import RegisterPage from '../pages/RegisterPage'
import MainpageLogin from '../pages/MainpageLogin'
import MyPage from '../pages/MyPage'
import ParkingMap from '../pages/ParkingMap'
import Chat from '../pages/ChatList'
import ChatRoom from '../pages/ChatRoom'
import ReviewWritePage from '../pages/ReviewWritePage'
import CustomerSupportPage from '../pages/CustomerSupportPage'
import BackgroundLayout from '../Layout/BackgroundLayout'
import PopularPage from '../pages/PopularPage'
import AIRecommendPage from '../pages/AIRecommendPage'
import ScrapEventsPage from '../pages/ScrapEventsPage'
import MyReviewPage from '../pages/MyReviewPage'
import TermsPage from '../pages/TermsPage'
import DeleteAccountPage from '../pages/DeleteAccountPage'
import AuthRedirect from '../pages/AuthRedirect'
import EditProfilePage from '../pages/EditProfilePage'
import FestivalAllPage from '../pages/FestivalAllPage'
import FestivalDetail from '../pages/FestivalDetail'
import ReviewPage from '../components/ReviewPage'

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
  { path: '/chat', element: <Chat /> },
    { path: '/chat/create-group', element: <CreateGroupChat /> },
  { path: '/mypage', element: <MyPage /> },
  { path: '/myreview', element: <MyReviewPage /> },
  { path: '/mainpage', element: <MainpageLogin /> },
  { path: '/ai', element: <AIRecommendPage /> },
  { path: '/popular', element: <PopularPage /> },
  { path: '/fest/detail', element: <FestivalDetail /> },
  { path: '/map', element: <ParkingMap /> },
  { path: '/fest/detail/review/write', element: <ReviewWritePage /> },
  { path: '/fest/detail/review', element: <ReviewPage /> },
  { path: '/fest/detail', element: <FestivalDetail /> },
    { path: '/chat/room/:roomId', element: <ChatRoom /> },
    { path: '/login-success', element: <AuthRedirect /> },
    { path: '/fest/all', element: <FestivalAllPage /> },
    { path: '/profile', element: <EditProfilePage /> },
    { path: '/scrap', element: <ScrapEventsPage /> },
    { path: '/term', element: <TermsPage /> },
    { path: '/register', element: <RegisterPage /> },
    { path: '/delete', element: <DeleteAccountPage /> },
])