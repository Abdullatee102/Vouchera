import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Organizations from './pages/Organizations';
import OrganizationDetail from './pages/OrganizationDetail';
import Programs from './pages/Programs';
import MyVouchers from './pages/MyVouchers';
import VoucherDetail from './pages/VoucherDetail';
import Merchants from './pages/Merchants';
import Activity from './pages/Activity';
import AdminDashboard from './pages/AdminDashboard';
import HowItWorks from './pages/HowItWorks';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/organizations" element={<Organizations />} />
          <Route path="/organizations/:orgId" element={<OrganizationDetail />} />
          <Route path="/programs" element={<Programs />} />
          <Route path="/my-vouchers" element={<MyVouchers />} />
          <Route path="/vouchers/:voucherId" element={<VoucherDetail />} />
          <Route path="/merchants" element={<Merchants />} />
          <Route path="/activity" element={<Activity />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
