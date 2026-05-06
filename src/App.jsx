import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Overview from './pages/Overview';
import MonthlyTargets from './pages/MonthlyTargets';
import RevenueTracking from './pages/RevenueTracking';
import Leads from './pages/Leads';
import KanbanBoard from './pages/KanbanBoard';
import Profitability from './pages/Profitability';

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/targets" element={<MonthlyTargets />} />
          <Route path="/revenue" element={<RevenueTracking />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/kanban" element={<KanbanBoard />} />
          <Route path="/profitability" element={<Profitability />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
