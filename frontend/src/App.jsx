import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Boutique from './pages/Boutique';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Collections from './pages/Collections';
import CollectionDetail from './pages/CollectionDetail';
import Contact from './pages/Contact';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import './App.css';

function App() {
  return (
    <CartProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <Routes>
            {/* Routes admin (sans header/footer) */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            
            {/* Routes publiques (avec header/footer) */}
            <Route path="/*" element={
              <>
                <Header />
                <main className="flex-grow">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/boutique" element={<Boutique />} />
                    <Route path="/panier" element={<Cart />} />
                    <Route path="/commande" element={<Checkout />} />
                    <Route path="/collections" element={<Collections />} />
                    <Route path="/collections/:id" element={<CollectionDetail />} />
                    <Route path="/notre-histoire" element={<div className="p-8 text-center">Page Notre Histoire - En développement</div>} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="*" element={<div className="p-8 text-center">Page non trouvée</div>} />
                  </Routes>
                </main>
                <Footer />
              </>
            } />
          </Routes>
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;
