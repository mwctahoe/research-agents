import { Outlet } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';

const lessons = [
  { id: '1', title: '1. Initialization', path: '/lesson/1' },
  { id: '2', title: '2. Basic Triangle', path: '/lesson/2' },
  { id: '3', title: '3. 3D Cube', path: '/lesson/3' },
];

const challenges = [
  { id: '1', title: '1. Textures', path: '/challenge/1' },
  { id: '2', title: '2. Basic Lighting', path: '/challenge/2' },
  { id: '3', title: '3. Orbit Camera', path: '/challenge/3' },
  { id: '4', title: '4. Post-processing', path: '/challenge/4' },
  { id: '5', title: '5. Instanced Drawing', path: '/challenge/5' },
];

function App() {
  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 font-sans w-full">
      <Sidebar lessons={lessons} challenges={challenges} />
      <main className="flex-1 relative h-full flex flex-col items-center justify-center overflow-hidden p-8">
        <div className="w-full max-w-5xl h-full flex flex-col">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default App;