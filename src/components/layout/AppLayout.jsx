import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

// Roster shell — sidebar + sticky topbar + scrolling page body.
// Uses CSS classes defined in styles/roster.css; no Tailwind here on purpose.
export default function AppLayout() {
  return (
    <div className="app">
      <Sidebar />
      <div className="main">
        <Header />
        <div className="page">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
