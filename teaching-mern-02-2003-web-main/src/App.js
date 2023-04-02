import React from 'react'
import './App.scss'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'

// custom components
import AppBar from 'components/AppBar/AppBar'
import BoardBar from 'components/BoardBar/BoardBar'
import BoardContent from 'components/BoardContent/BoardContent'
import Auth from 'components/Auth/Auth'
import AccountVerification from 'components/Auth/AccountVerification/AccountVerification'

import { useSelector } from 'react-redux'
import { selectIsAuthenticated, selectCurrentUser } from 'redux/user/userSlice'
import UserPage from 'components/UserPage/UserPage'
import Boards from 'components/Boards/Boards'
import ActiveCardModal from 'components/Common/ActiveCardModal'
import { selectCurrentActiveCard } from 'redux/activeCard/activeCardSlice'

function App() {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const currentUser = useSelector(selectCurrentUser)
  const currentActiveCard = useSelector(selectCurrentActiveCard)

  const publicRoutes = ['/signIn', '/signUp', '/account/verification', '/404']
  const location = useLocation()
  if (!publicRoutes.includes(location.pathname) && !isAuthenticated) {
    return <Navigate to='/signIn' />
  }

  return (
    <Routes>
      <Route path='/' element={
        <Navigate to={`/u/${currentUser?.username}/boards?currentPage=1&itemsPerPage=12`} />
      } />

      <Route path='/b/:boardId' element={
        <div className="trello-trongnghia-master">
          <AppBar />
          <BoardBar />
          <BoardContent />
          {currentActiveCard && <ActiveCardModal />}
        </div>
      } />

      <Route path='/signIn' element={<Auth />} />
      <Route path='/signUp' element={<Auth />} />
      <Route path='/account/verification' element={<AccountVerification />} />

      <Route path='/u/:username' element={
        <div className="user__page">
          <AppBar />
          <UserPage />
        </div>
      } />

      <Route path='/u/:username/boards' element={
        <div className="boards__page">
          <AppBar />
          <Boards />
        </div>
      } />

      <Route path='*' element={
        <div className="not-found">
          <h3>404 not found</h3>
        </div>
      } />
    </Routes>
  )
}

export default App
