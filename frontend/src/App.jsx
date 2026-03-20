import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Books from './pages/Books';
import Members from './pages/Members';
import Borrows from './pages/Borrows';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a2235',
            color: '#f1f5f9',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '10px',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#1a2235' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#1a2235' } },
        }}
      />
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/"        element={<Dashboard />} />
            <Route path="/books"   element={<Books />}     />
            <Route path="/members" element={<Members />}   />
            <Route path="/borrows" element={<Borrows />}   />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
