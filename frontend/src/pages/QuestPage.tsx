import { useState } from 'react'


function QuestPage() {
  const [count, setCount] = useState<number>(0);
  return (
    <>
      <h1>
        Goal Page
        {count}
      </h1>
      <button onClick={() => {setCount(count + 1)}}>Click here!</button>
    </>
  )
}

export default QuestPage;
