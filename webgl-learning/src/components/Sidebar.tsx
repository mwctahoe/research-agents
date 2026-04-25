import { NavLink } from 'react-router-dom';
import { BookOpen, Trophy } from 'lucide-react';

interface SidebarProps {
  lessons: { id: string; title: string; path: string }[];
  challenges: { id: string; title: string; path: string }[];
}

export function Sidebar({ lessons, challenges }: SidebarProps) {
  return (
    <div className="w-64 bg-slate-900 text-slate-300 h-screen overflow-y-auto flex-shrink-0 border-r border-slate-700">
      <div className="p-4 border-b border-slate-700">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          WebGL Learning
        </h1>
        <p className="text-sm text-slate-400 mt-2">
          Master the basics to advanced techniques
        </p>
      </div>

      <div className="p-4">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <BookOpen size={16} />
          Lessons
        </h2>
        <ul className="space-y-1 mb-8">
          {lessons.map((lesson) => (
            <li key={lesson.id}>
              <NavLink
                to={lesson.path}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                {lesson.title}
              </NavLink>
            </li>
          ))}
        </ul>

        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Trophy size={16} />
          Challenges
        </h2>
        <ul className="space-y-1">
          {challenges.map((challenge) => (
            <li key={challenge.id}>
              <NavLink
                to={challenge.path}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md transition-colors ${
                    isActive
                      ? 'bg-emerald-600 text-white'
                      : 'hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                {challenge.title}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}