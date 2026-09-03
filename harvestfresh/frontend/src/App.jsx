import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useStore } from './store/useStore';
import { CustomerLayout } from './layouts/CustomerLayout';
import { AdminLayout } from './layouts/AdminLayout';

import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { ProductDetail } from './pages/ProductDetail';
import { MonthlyPass } from './pages/MonthlyPass';
import { Login } from './pages/Login';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { OrderConfirmation } from './pages/OrderConfirmation';
import { OrderHistory } from './pages/OrderHistory';
import { Account } from './pages/Account';
import { SubscriptionManagement } from './pages/SubscriptionManagement';
import { DeliveryCoverage } from './pages/DeliveryCoverage';

import { AdminDashboard } from './pages/AdminDashboard';
import { AdminProducts } from './pages/AdminProducts';
import { AdminOrders } from './pages/AdminOrders';
import { AdminSubscriptions } from './pages/AdminSubscriptions';

export const App = () => {
  const fetchCart = useStore((state) => state.fetchCart);
  const token = useStore((state) => state.token);

  useEffect(() => {
    if (token) {
      fetchCart();
    }
  }, [token, fetchCart]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Customer Storefront Routes */}
        <Route path="/" element={<CustomerLayout />}>
          <Route index element={<Home />} />
          <Route path="shop" element={<Shop />} />
          <Route path="product/:slug" element={<ProductDetail />} />
          <Route path="monthly-pass" element={<MonthlyPass />} />
          <Route path="login" element={<Login />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="order-confirmation/:orderId" element={<OrderConfirmation />} />
          <Route path="order-history" element={<OrderHistory />} />
          <Route path="account" element={<Account />} />
          <Route path="subscription-management" element={<SubscriptionManagement />} />
          <Route path="delivery-coverage" element={<DeliveryCoverage />} />
        </Route>

        {/* Admin Dashboard Protected Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="subscriptions" element={<AdminSubscriptions />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
