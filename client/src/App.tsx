import React, { Suspense, lazy, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProtectedRoute from './components/routes/ProtectedRoute';
import PublicRoute from './components/routes/PublicRoute';
import AdminRoute from './components/routes/AdminRoute';
import Loader from './components/common/Loader'; // Import Loader
import { useGetMeQuery } from './redux/api/user.api';
import { userExists, setAnonymousUser } from './redux/reducers/user.reducer';
import { AppDispatch, RootState } from './redux/store';
import { getOrCreateAnonymousUserId, clearAnonymousUserId } from './utils/anonymousUser';
import PageViewTracker from './components/common/PageViewTracker';
import SessionTracker from './components/common/SessionTracker';

// Register Chart.js components
import { CategoryScale, Chart as ChartJS, Legend, LineElement, LinearScale, PointElement, Title, Tooltip } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// Lazy load public components
const HomePage = lazy(() => import('./pages/HomePage'));
const Layout = lazy(() => import('./components/layout/Layout'));
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const AboutPage = lazy(() => import('./pages/About'));
const CartPage = lazy(() => import('./pages/CartPage'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));
const ProductRatingsPage = lazy(() => import('./pages/ProductRatingsPage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const CheckoutForm = lazy(() => import('./components/CheckoutForm'));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'));
// const Shipping = lazy(() => import('./pages/shipping'));
const Shipping = lazy(() => import('./pages/Shipping'));
const SearchPage = lazy(() => import('./pages/SearchPage'));

// Lazy load admin components
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const AdminCustomers = lazy(() => import('./pages/admin/AdminCustomers'));
const AdminTransactions = lazy(() => import('./pages/admin/AdminTransactions'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminAddProduct = lazy(() => import('./components/admin/AddProduct'));
const AdminCoupons = lazy(() => import('./pages/admin/Coupons'));
const AdminFeaturedProducts = lazy(() => import('./pages/admin/FeaturedProduct'));
const AdminManageProduct = lazy(() => import('./components/admin/ManageProduct'));
const AdminOrderDetails = lazy(() => import('./pages/admin/AdminOrderDetails'));
const AdminLooker = lazy(() => import('./pages/admin/AdminLooker'));

// Other pages
const MyOrders = lazy(() => import('./pages/MyOrders'));
const OrderDetails = lazy(() => import('./pages/OrderDetails'));
const NotFoundPage = lazy(() => import('./pages/NotFound'));

const App: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { data, error } = useGetMeQuery();
    const { loading } = useSelector((state: RootState) => state.user);

    // Dispatch user status on data or error change
    useEffect(() => {
        if (data?.user) {
            // User is logged in - clear anonymous user ID
            clearAnonymousUserId();
            dispatch(userExists(data.user));
        } else if (error) {
            // No logged-in user - create/use anonymous user (session-only)
            const anonymousUserId = getOrCreateAnonymousUserId();
            dispatch(setAnonymousUser(anonymousUserId));
        }
    }, [data, error, dispatch]);

    // Show loader while loading user data
    if (loading) return <Loader />;

    return (
        <>

            <ToastContainer position="bottom-center" />
            <div className="flex flex-col min-h-screen">
                <Router>
                    <PageViewTracker />
                    <SessionTracker />
                    <Suspense fallback={<Loader />}>
                        <Routes>
                            {/* Public routes */}
                            <Route path="/" element={<Layout />}>
                                <Route index element={<HomePage />} />
                                <Route path="about" element={<AboutPage />} />
                                <Route path="products" element={<ProductsPage />} />
                                <Route path="product/:productId" element={<ProductDetails />} />
                                <Route path="products/:productId/ratings" element={<ProductRatingsPage />} />
                                <Route path="search" element={<SearchPage />} />
                                <Route path="cart" element={<CartPage />} />
                            </Route>

                            {/* Public routes */}
                            <Route element={<PublicRoute />}>
                                <Route path="auth" element={<AuthPage />} />
                            </Route>

                            {/* Protected routes */}
                            <Route element={<ProtectedRoute />}>
                                <Route element={<Layout />}>
                                    <Route path="profile" element={<ProfilePage />} />
                                    <Route path="my-orders" element={<MyOrders />} />
                                    <Route path="/order/:id" element={<OrderDetails />} />
                                </Route>
                                <Route path="shipping" element={<Shipping />} />
                                <Route path="checkout" element={<CheckoutForm />} />
                                <Route path="order-success" element={<OrderSuccess />} />
                            </Route>

                            {/* Admin routes */}
                            <Route element={<AdminRoute />}>
                                <Route path="/admin" element={<AdminLayout />}>
                                    {/* Redirect to /admin/dashboard if /admin is accessed directly */}
                                    <Route index element={<Navigate to="/admin/dashboard" replace />} />
                                    <Route path="dashboard" element={<AdminDashboard />} />
                                    <Route path="products" element={<AdminProducts />} />
                                    <Route path="featured" element={<AdminFeaturedProducts />} />
                                    <Route path="products/new" element={<AdminAddProduct />} />
                                    <Route path="products/:productId" element={<AdminManageProduct />} />
                                    <Route path="customers" element={<AdminCustomers />} />
                                    <Route path="transactions" element={<AdminTransactions />} />
                                    <Route path="coupons" element={<AdminCoupons />} />
                                    <Route path="orders" element={<AdminOrders />} />
                                    <Route path="orders/:orderId" element={<AdminOrderDetails />} />
                                    <Route path="looker" element={<AdminLooker />} />
                                </Route>
                            </Route>

                            {/* Fallback route */}
                            <Route path="*" element={<NotFoundPage />} />
                        </Routes>
                    </Suspense>
                </Router>
            </div>
        </>
    );
};

export default App;
