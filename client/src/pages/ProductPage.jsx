// src/pages/ProductPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Fuel, Gauge } from 'lucide-react';
import { getProduct } from '../services/product-api';
import { useModal } from '../contexts/ModalContext';
import { useAuth } from '../contexts/AuthContext';
import LoginComponent from '../components/LoginComponent';
import { toast, Toaster } from 'sonner';
import NavBar from '../components/NavBar';
import { startChat } from '../services/chat-api';
import { getUser } from '../services/auth';
import { useChat } from '../contexts/ChatContext';
import Swal from 'sweetalert2';

// Components
import ProductImageCarousel from '../components/ProductImageCarousel';
import ProductOverview from '../components/ProductOverview';
import ProductMap from '../components/ProductMap';
import RelatedProducts from '../components/RelatedProducts';
import ProductInfoCard from '../components/ProductInfoCard';
import Footer from '../components/Footer';
import MobileBottomNav from '../components/MobileBottomNav';

export default function ProductPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isOwner, setIsOwner] = useState(false);
    const [userId, setUserId] = useState(null);

    const { isLoginOpen, openLogin } = useModal();
    const { isAuthenticated } = useAuth();
    const { openChat } = useChat();

    // Load product
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const res = await getProduct(id);
                setProduct(res.data);
            } catch (error) {
                console.error('Failed to load product:', error);
                toast.error('Could not load product details.');
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchProduct();
    }, [id]);

    // Check owner
    useEffect(() => {
        const checkOwner = async () => {
            if (!product || !product.user) return;

            try {
                const user = await getUser();
                if (!user) return;

                setUserId(user._id);
                const productUserId = product.user._id || product.user;
                setIsOwner(String(user._id) === String(productUserId));
            } catch (err) {
                console.error('Failed to check ownership:', err);
            }
        };

        checkOwner();
    }, [product]);

    // Favorites Logic
    const [isFavorite, setIsFavorite] = useState(false);
    const { userData, checkAuthStatus } = useAuth(); // Ensure userData is available

    useEffect(() => {
        if (userData?.favorites?.includes(product?._id)) {
            setIsFavorite(true);
        } else {
            setIsFavorite(false);
        }
    }, [userData, product]);

    const handleFavorite = async (e) => {
        if (e) e.stopPropagation();
        if (!isAuthenticated) {
            Swal.fire({
                title: 'Login Required',
                text: 'You need to be logged in to add to favorites.',
                icon: 'warning',
                confirmButtonColor: '#8069AE'
            });
            return;
        }

        // Optimistic update
        setIsFavorite(!isFavorite);

        try {
            const { toggleFavorite } = await import('../services/auth'); // Lazy import or move to top
            const res = await toggleFavorite(product._id);
            if (res.success) {
                toast.success(res.message);
                checkAuthStatus();
            } else {
                setIsFavorite(!isFavorite); // Revert
                toast.error(res.message);
            }
        } catch (error) {
            setIsFavorite(!isFavorite);
            console.error(error);
        }
    };

    const handleContact = async (initialMessage = '') => {
        if (!isAuthenticated) {
            toast.info('You need to be logged in', {
                description: 'to contact sellers',
            });
            openLogin();
            return;
        }

        if (!product || !product._id || !product.user) {
            toast.error('Product data is incomplete. Please refresh.');
            return;
        }

        try {
            const response = await startChat(product._id);
            if (!response?.data?._id) {
                throw new Error('Chat creation failed: Missing chat ID');
            }

            openChat({
                chatId: response.data._id,
                user: product.user,
                product: product,
                currentUserId: userId,
                initialText: initialMessage
            });

        } catch (err) {
            console.error('Chat initiation failed:', err);
            toast.error('Unable to start chat. Please try again later.');
        }
    };

    const handleMakeOffer = () => {
        const defaultOffer = `Hi, is this ${product.title} still available?`;
        handleContact(defaultOffer);
    };

    // 🟡 Loading state
    if (loading) {
        return (
            <div className="flex flex-col min-h-screen">
                <Toaster position="top-right" />
                <NavBar />
                <div className="flex-1 flex flex-col items-center justify-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
                    <p className="text-gray-500 font-medium">Loading product details...</p>
                </div>
                <MobileBottomNav />
            </div>
        );
    }

    // 🔴 Product not found
    if (!product) {
        return (
            <div className="flex flex-col min-h-screen">
                <Toaster position="top-right" />
                <NavBar />
                <div className="flex-1 flex flex-col items-center justify-center gap-4">
                    <div className="text-gray-300">
                        <svg className="w-20 h-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p className="text-xl font-semibold text-gray-900">Product not found</p>
                    <button
                        onClick={() => window.history.back()}
                        className="text-primary hover:text-primary-dark font-medium hover:underline"
                    >
                        Go back
                    </button>
                </div>
                <MobileBottomNav />
            </div>
        );
    }

    const isVehicle = (() => {
        const catTitle = product.category?.title || (typeof product.category === 'string' ? product.category : '') || '';
        return ['car', 'vehicle', 'motor', 'bike', 'scooter'].some(k => catTitle.toLowerCase().includes(k));
    })();

    return (
        <div className="w-full bg-gray-50/50 min-h-screen">
            <Toaster position="top-right" />
            <NavBar />
            <MobileBottomNav />

            {isLoginOpen && <LoginComponent />}

            {/* Breadcrumb */}
            <div className="px-4 md:px-10 py-2 text-sm text-gray-500">
                <span>{product.title}</span>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 px-4 md:px-10 pb-10">

                {/* Left: Image Carousel */}
                <div className="lg:w-2/3">
                    <ProductImageCarousel images={product.images} />
                </div>


                <div className="lg:w-1/3">
                    <ProductInfoCard
                        product={product}
                        onChatClick={() => handleContact()}
                        onMakeOfferClick={handleMakeOffer}
                        isOwner={isOwner}
                        currentUserId={userId}
                        isFavorite={isFavorite}
                        onFavoriteToggle={handleFavorite}
                    />
                </div>

            </div>

            {/* Product Overview + Map */}
            <div className="w-full bg-white border-y border-gray-100">
                <div className="px-4 md:px-16 lg:px-24 py-12">
                    <div className="flex flex-col md:flex-row justify-between gap-12 lg:gap-24">
                        <div className="md:w-7/12 lg:w-2/3 space-y-6">
                            <div>


                                <div className="flex flex-wrap items-center gap-4 mb-8">
                                    <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-1.5 rounded-md border border-gray-100 text-xs font-semibold uppercase tracking-wide">
                                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                        <span>{product.form_data?.year || product.form_data?.Year || new Date(product.createdAt).getFullYear()}</span>
                                    </div>
                                    {isVehicle && (
                                        <>
                                            <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-1.5 rounded-md border border-gray-100 text-xs font-semibold uppercase tracking-wide">
                                                <Gauge className="w-3.5 h-3.5 text-gray-400" />
                                                <span>{product.form_data?.km_driven || product.form_data?.KMDriven || product.form_data?.['KM Driven'] || 'N/A'}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-1.5 rounded-md border border-gray-100 text-xs font-semibold uppercase tracking-wide">
                                                <Fuel className="w-3.5 h-3.5 text-gray-400" />
                                                <span>{product.form_data?.fuel || product.form_data?.Fuel || 'N/A'}</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                                <hr className="border-gray-100" />
                            </div>
                            <ProductOverview product={product} />
                        </div>
                        <div className="md:w-5/12 lg:w-1/3">
                            <div className="sticky top-24">
                                <h3 className="font-bold text-gray-900 mb-4 text-lg">Location</h3>
                                <div className="rounded-xl overflow-hidden shadow-lg border border-gray-200 h-[320px] relative z-0">
                                    <ProductMap location={product.location} />
                                </div>
                                <p className="text-xs text-gray-500 mt-2 text-center">
                                    Map location is approximate
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className='w-full px-4 md:px-16 lg:px-24 py-16 bg-gray-50'>
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">Related Products</h2>
                    <button
                        onClick={() => navigate(`/catalogue?category=${product.category?._id || product.category}`)}
                        className="text-primary hover:text-primary-dark font-medium hover:underline"
                    >
                        View all
                    </button>
                </div>
                <RelatedProducts productId={id} />
            </div>

            {/* Footer */}
            <div className="mt-0">
                <Footer />
            </div>
        </div>
    );
}