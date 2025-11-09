// src/layout/BackgroundLayout.tsx
import React from 'react'
import Background from '../components/Background' // 배경 컴포넌트 경로에 맞게 수정
import { Outlet } from 'react-router-dom'

const BackgroundLayout: React.FC = () => {
  return (
    <>
      <Background />
      <Outlet /> {/* 현재 라우트에 해당하는 페이지가 여기에 렌더링됨 */}
    </>
  )
}

export default BackgroundLayout
