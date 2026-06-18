import { Routes, Route, Navigate } from 'react-router-dom';

import NavBar from './components/NavBar';

import Home from './pages/Home';
import Products from './pages/Products';
import AddProduct from './pages/AddProduct';
import Orders from './pages/Orders';
import SellerDashboard from './pages/SellerDashboard';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';

import SellerRegister from './SellerRegister';
import AddressBook from './AddressBook';
import Analytics from './Analytics';
import FAQ from './FAQ';
import About from './About';
import EMI from './EMI';

import ProtectedRoute from './components/ProtectedRoute';
import { getStoredUser } from './authUser';

function AdminGuard({ children }) {
  const user = getStoredUser();

  return user?.role === 'ADMIN' || user?.role === 'SELLER'
    ? <Navigate to="/" replace />
    : children;
}

function App() {
  return (
    <div className="app-shell">
      <NavBar />

      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <Products />
            </ProtectedRoute>
          }
        />

        <Route
          path="/cart"
          element={
            <AdminGuard>
              <Cart />
            </AdminGuard>
          }
        />

        <Route
          path="/checkout"
          element={
            <AdminGuard>
              <Checkout />
            </AdminGuard>
          }
        />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/seller-register" element={<SellerRegister />} />

        <Route
          path="/address-book"
          element={
            <ProtectedRoute>
              <AddressBook />
            </ProtectedRoute>
          }
        />

        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          }
        />

        <Route path="/faq" element={<FAQ />} />
        <Route path="/about" element={<About />} />
        <Route path="/emi" element={<EMI />} />

        <Route
          path="/seller-dashboard"
          element={
            <ProtectedRoute role="SELLER">
              <SellerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/add-product"
          element={
            <ProtectedRoute role="SELLER">
              <AddProduct />
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>

      <footer className="site-footer">
        <p>
          2026 InstaBuy Ecommerce |
          <a href="/"> Home</a> |
          <a href="/#featured-products"> Products</a> |
          <a href="/seller-register"> Seller Registration</a> |
          <a href="/faq"> FAQ</a> |
          <a href="mailto:support@instabuy.com"> Support</a> |
          <a href="https://www.linkedin.com" target="_blank" rel="noreferrer"> LinkedIn</a>
        </p>
      </footer>
    </div>
  );
}

export default App;
