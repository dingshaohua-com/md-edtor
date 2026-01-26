import { bars } from './helper';

export default function Toolbar() {
  return (
    <div className='border-b p-2 flex'>
      {bars.map((bar) => (
        <div key={bar.type} className="flex items-center gap-1 border-r border-gray-200 pr-2">
          {bar.content.map(({ icon: Icon, tooltip, id }) => (
            <Icon key={id} className="bg-gray-100 rounded p-1 box-content cursor-pointer" size={16} />
          ))}
        </div>
      ))}
    </div>
  );
}
