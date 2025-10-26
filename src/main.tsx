
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from './routes'
import './styles/global.css'
import {
    QueryClient,
    QueryClientProvider,
  } from '@tanstack/react-query';
import OpenExternalBrowser from './OpenExternalBrowser';
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5분
        retry: 1,                 // 실패 시 1회 재시도
      },
    },
  });

ReactDOM.createRoot(document.getElementById('root')!).render(
    <QueryClientProvider client={queryClient}>
        <OpenExternalBrowser />
        <RouterProvider router={router} />
    </QueryClientProvider>


)
