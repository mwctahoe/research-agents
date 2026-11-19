import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import { Lesson1 } from './lessons/Lesson1.tsx';
import { Lesson2 } from './lessons/Lesson2.tsx';
import { Lesson3 } from './lessons/Lesson3.tsx';
import { Challenge1 } from './challenges/Challenge1.tsx';
import { Challenge2 } from './challenges/Challenge2.tsx';
import { Challenge3 } from './challenges/Challenge3.tsx';
import { Challenge4 } from './challenges/Challenge4.tsx';
import { Challenge5 } from './challenges/Challenge5.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Navigate to="/lesson/1" replace />} />
          <Route path="lesson/1" element={<Lesson1 />} />
          <Route path="lesson/2" element={<Lesson2 />} />
          <Route path="lesson/3" element={<Lesson3 />} />
          <Route path="challenge/1" element={<Challenge1 />} />
          <Route path="challenge/2" element={<Challenge2 />} />
          <Route path="challenge/3" element={<Challenge3 />} />
          <Route path="challenge/4" element={<Challenge4 />} />
          <Route path="challenge/5" element={<Challenge5 />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);