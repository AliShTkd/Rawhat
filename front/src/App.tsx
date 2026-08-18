import { createSignal } from 'solid-js'
import solidLogo from './assets/solid.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import HomePage from './pages/Home/Home.tsx'


function App() {
  const [count, setCount] = createSignal(0)

  return (
    <HomePage></HomePage>
  )
}

export default App
