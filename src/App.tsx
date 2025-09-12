import { useState } from 'react'
import './App.css'
import { Button } from "../";

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Button>你好</Button>
    </>
  )
}

export default App
