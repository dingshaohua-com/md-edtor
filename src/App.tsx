import './App.css'
import MdEditor from "../lib";

function App() {
  return (
    <div className='demos h-full w-300 bg-amber-50 m-auto px-8 flow-root'>
      <div className='demo mt-10'>
        <div>以下为一个基础使用示例：</div>
        <MdEditor className='bg-white w-200 h-100 mt-2' />
      </div>
    </div>
  )
}

export default App
