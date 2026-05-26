import { Route, Routes } from "react-router-dom";
import CartSidebar from "./components/CartSidebar.jsx";
import FloatingWhatsApp from "./components/FloatingWhatsApp.jsx";
import Footer from "./components/Footer.jsx";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import ScrollToHash from "./components/ScrollToHash.jsx";
import Checkout from "./pages/Checkout.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Memberships from "./pages/Memberships.jsx";
import OrderSuccess from "./pages/OrderSuccess.jsx";
import Orders from "./pages/Orders.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";
import Products from "./pages/Products.jsx";
import Register from "./pages/Register.jsx";
import AdminCustomers from "./pages/admin/AdminCustomers.jsx";
import AdminLayout from "./pages/admin/AdminLayout.jsx";
import AdminMemberships from "./pages/admin/AdminMemberships.jsx";
import AdminProducts from "./pages/admin/AdminProducts.jsx";
import AdminReports from "./pages/admin/AdminReports.jsx";
import AdminTransactions from "./pages/admin/AdminTransactions.jsx";
import Dashboard from "./pages/admin/Dashboard.jsx";
import AdminPaymentGateway from "./pages/admin/AdminPaymentGateway.jsx";

function PublicLayout({ children }) {
  return (
    <>
      <ScrollToHash />
      <Navbar />
      {children}
      <Footer />
      <CartSidebar />
      <FloatingWhatsApp />
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
      <Route path="/products" element={<PublicLayout><Products /></PublicLayout>} />
      <Route path="/products/:id" element={<PublicLayout><ProductDetail /></PublicLayout>} />
      <Route path="/memberships" element={<PublicLayout><Memberships /></PublicLayout>} />
      <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
      <Route path="/register" element={<PublicLayout><Register /></PublicLayout>} />
      <Route path="/checkout" element={<PublicLayout><ProtectedRoute><Checkout /></ProtectedRoute></PublicLayout>} />
      <Route path="/orders" element={<PublicLayout><ProtectedRoute><Orders /></ProtectedRoute></PublicLayout>} />
      <Route path="/order-success/:id" element={<PublicLayout><ProtectedRoute><OrderSuccess /></ProtectedRoute></PublicLayout>} />
      <Route path="/admin" element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="memberships" element={<AdminMemberships />} />
        <Route path="transactions" element={<AdminTransactions />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="customers" element={<AdminCustomers />} />
        <Route path="payment-gateway" element={<AdminPaymentGateway />} />
      </Route>
    </Routes>
  );
}
