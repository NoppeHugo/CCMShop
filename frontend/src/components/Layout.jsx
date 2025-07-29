import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import DataSourceChecker from '../utils/DataSourceChecker';

const Layout = () => {
  const isAdmin = window.location.pathname.includes('/admin');

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      {/* Vérificateur de source de données (visible uniquement pour les admins) */}
      {isAdmin && (
        <div className="container mx-auto px-4 mt-2">
          <DataSourceChecker />
        </div>
      )}
      
      <main className="flex-grow">
        <Outlet />
      </main>
      
      <Footer />
    </div>
  );
};

export default Layout;