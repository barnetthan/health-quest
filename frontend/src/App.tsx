import { useState } from 'react'


function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <h1>
        Hello World
      </h1>
      <div>
        Count: {count}
      </div>
      <button onClick={() => {setCount(count + 1)}}>Click here!</button>
    </>
  )
}

export default App
