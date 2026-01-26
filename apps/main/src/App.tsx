import './App.css';
import Card from '@repo/ui-custom/card';
import HelloWorld from '@/compnents/hello-world';

const App = () => {
  return (
    <div className="content">
      <div className="text-red-400">呵呵</div>
      <Card>你好啊</Card>
      <HelloWorld />
    </div>
  );
};

export default App;
