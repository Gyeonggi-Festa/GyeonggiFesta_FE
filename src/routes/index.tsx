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
import LikedEventsPage from '../pages/LikedEventsPage'
import MyReviewPage from '../pages/MyReviewPage'
import TermsPage from '../pages/TermsPage'
import DeleteAccountPage from '../pages/DeleteAccountPage'
import AuthRedirect from '../pages/AuthRedirect'
import LoginFailedPage from '../pages/LoginFailedPage'
import EditProfilePage from '../pages/EditProfilePage'
import FestivalAllPage from '../pages/FestivalAllPage'
import FestivalDetail from '../pages/FestivalDetail'
import ReviewPage from '../components/ReviewPage'
import MeetingPotPage from '../pages/MeetingPotPage'
import MeetingPotWritePage from '../pages/MeetingPotWritePage'
import MeetingPotDetailPage from '../pages/MeetingPotDetailPage'
import ProtectedRoute from '../components/ProtectedRoute'

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
  { 
    path: '/chat', 
    element: (
      <ProtectedRoute>
        <Chat />
      </ProtectedRoute>
    )
  },
  { 
    path: '/chat/create-group', 
    element: (
      <ProtectedRoute>
        <CreateGroupChat />
      </ProtectedRoute>
    )
  },
  { 
    path: '/mypage', 
    element: (
      <ProtectedRoute>
        <MyPage />
      </ProtectedRoute>
    )
  },
  { 
    path: '/myreview', 
    element: (
      <ProtectedRoute>
        <MyReviewPage />
      </ProtectedRoute>
    )
  },
  { 
    path: '/mainpage', 
    element: (
      <ProtectedRoute>
        <MainpageLogin />
      </ProtectedRoute>
    )
  },
  { 
    path: '/ai', 
    element: (
      <ProtectedRoute>
        <AIRecommendPage />
      </ProtectedRoute>
    )
  },
  { 
    path: '/popular', 
    element: (
      <ProtectedRoute>
        <PopularPage />
      </ProtectedRoute>
    )
  },
  { 
    path: '/fest/detail', 
    element: <FestivalDetail />
  },
  { 
    path: '/map', 
    element: (
      <ProtectedRoute>
        <ParkingMap />
      </ProtectedRoute>
    )
  },
  { 
    path: '/fest/detail/review/write', 
    element: (
      <ProtectedRoute>
        <ReviewWritePage />
      </ProtectedRoute>
    )
  },
  { 
    path: '/fest/detail/review', 
    element: <ReviewPage />
  },
  { 
    path: '/chat/room/:roomId', 
    element: (
      <ProtectedRoute>
        <ChatRoom />
      </ProtectedRoute>
    )
  },
  { path: '/login-success', element: <AuthRedirect /> },
  { path: '/login-failed', element: <LoginFailedPage /> },
  { 
    path: '/fest/all', 
    element: <FestivalAllPage />
  },
  { 
    path: '/profile', 
    element: (
      <ProtectedRoute>
        <EditProfilePage />
      </ProtectedRoute>
    )
  },
  { 
    path: '/scrap', 
    element: (
      <ProtectedRoute>
        <ScrapEventsPage />
      </ProtectedRoute>
    )
  },
  { 
    path: '/liked', 
    element: (
      <ProtectedRoute>
        <LikedEventsPage />
      </ProtectedRoute>
    )
  },
  { path: '/term', element: <TermsPage /> },
  { path: '/register', element: <RegisterPage /> },
  { 
    path: '/delete', 
    element: (
      <ProtectedRoute>
        <DeleteAccountPage />
      </ProtectedRoute>
    )
  },
  { 
    path: '/meetingpot', 
    element: (
      <ProtectedRoute>
        <MeetingPotPage />
      </ProtectedRoute>
    )
  },
  { 
    path: '/meetingpot/write', 
    element: (
      <ProtectedRoute>
        <MeetingPotWritePage />
      </ProtectedRoute>
    )
  },
  { 
    path: '/meetingpot/:postId', 
    element: (
      <ProtectedRoute>
        <MeetingPotDetailPage />
      </ProtectedRoute>
    )
  },
])