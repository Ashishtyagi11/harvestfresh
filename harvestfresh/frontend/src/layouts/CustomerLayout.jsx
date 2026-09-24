import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Toast } from '../components/Toast';
import { SalesBanner } from '../components/SalesBanner';

export const CustomerLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-on-background">
      <SalesBanner />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <Toast />
    </div>
  );
};
