import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import HomePage from './components/common/HomePage'
import { Route, Routes } from 'react-router-dom'
//import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
        <Routes>
          <Route path="/" element={<HomePage />}></Route>
        </Routes>
    </>
  )
}

export default App
