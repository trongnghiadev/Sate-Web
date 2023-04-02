import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import reportWebVitals from './reportWebVitals'
import 'font-awesome/css/font-awesome.min.css'

import { store } from 'redux/store'
import { Provider } from 'react-redux'

import { BrowserRouter } from 'react-router-dom'

import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import { PersistGate } from 'redux-persist/integration/react'
import { persistStore } from 'redux-persist'
let persistor = persistStore(store)

import { injectStore } from 'utilities/customAxios'
injectStore(store)

import { io } from 'socket.io-client'
import { API_ROOT } from 'utilities/constants'
export const socketIoInstance = io(API_ROOT)

const container = document.getElementById('root')
const root = createRoot(container)
root.render(
  <BrowserRouter>
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <App />
        <ToastContainer />
      </PersistGate>
    </Provider>
  </BrowserRouter>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
