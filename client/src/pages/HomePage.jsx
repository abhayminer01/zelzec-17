import React from 'react'
import NavBar from '../components/NavBar'
import * as Icons from "lucide-react"
import { useModal } from '../contexts/ModalContext'
import { Toaster, toast } from 'sonner'
import { useSell } from '../contexts/SellContext';
import SelectCategory from '../components/sell/SelectCategory';
import AddDetails from '../components/sell/AddDetails';
import UploadImage from '../components/sell/UploadImage';
import SelectLocation from '../components/sell/SelectLocation';
import SetPrice from '../components/sell/SetPrice';
import FinalStep from '../components/sell/FinalStep';
import { getPrimaryCategories } from '../services/category-api';
import { useState } from 'react';
import { useEffect } from 'react';
import MobileBottomNav from '../components/MobileBottomNav';
import { getHomePageData, getListedProducts } from '../services/product-api'
import Footer from '../components/Footer'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate, useSearchParams } from 'react-router-dom';
import Swal from "sweetalert2";
import ProductScrollSection from '../components/ProductScrollSection';
import HomeProductCard from '../components/HomeProductCard';

export default function HomePage() {
  const [category, setCategory] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  const { openLogin, openVerifyEmail } = useModal();
  const { step, nextStep, clearStep } = useSell();
  const { isAuthenticated, userData } = useAuth();

  const navigate = useNavigate()

  const [registerPrefill, setRegisterPrefill] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    fetchHomeData();
    fetchPrimaryCategories();
  }, []);


  const fetchHomeData = async () => {
    setLoading(true);
    try {
      const res = await getHomePageData();
      if (res.success) {
        setFeaturedProducts(res.data.featured);
        setSections(res.data.sections);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const fetchPrimaryCategories = async () => {
    try {
      const res = await getPrimaryCategories();
      if (res.success) {
        setCategory(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  }

  const handlePostAdButton = async () => {
    if (!isAuthenticated) {
      openLogin();
    } else {
      // Check for verification
      if (!userData?.isVerified) {
        toast.error("Please verify your email to post ads.");
        openVerifyEmail(userData?.email);
        return;
      }
      if (step === 0) {
        try {
          const res = await getListedProducts();
          if (res.success && res.data.length >= 8) {
            Swal.fire({
              icon: 'warning',
              title: 'Limit Reached',
              text: "You have reached the maximum limit of 8 products.",
              confirmButtonColor: '#7C5CB9'
            });
          } else {
            nextStep();
          }
        } catch (error) {
          console.error(error);
          toast.error("Could not verify limits. Please try again.");
        }
      } else {
        clearStep();
      }
    }
  }



  const handleCategoryClick = (id) => {
    navigate(`/category/${id}`)
  }

  return (
    <div className='min-h-screen bg-white'>
      <Toaster position='top-right' />
      <NavBar />
      <MobileBottomNav />
      <MobileBottomNav />
      {step === 1 && <SelectCategory />}
      {step === 2 && <AddDetails />}
      {step === 3 && <UploadImage />}
      {step === 4 && <SelectLocation />}
      {step === 5 && <SetPrice />}
      {step === 6 && <FinalStep />}

      {/* Hero Banner */}
      <div className="w-full relative">
        <img
          src="images/image.png"
          className='w-full md:h-[400px] h-48 object-cover'
          alt="Banner"
        />
        {/* Overlay gradient if needed, or keeping plain as per image */}
      </div>

      <div className='max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-12 space-y-16'>

        {/* Categories Grid */}
        <section>
          <h2 className='text-xl font-medium text-gray-800 mb-6'>Browse Categories</h2>
          <div className='grid grid-cols-3 md:grid-cols-6 gap-4'>
            {category.map((item, index) => {
              let Icon = Icons[item.icon];
              return (
                <div
                  onClick={() => handleCategoryClick(item._id)}
                  key={index}
                  className='bg-white border text-center py-6 px-2 rounded-lg hover:shadow-md hover:border-primary/30 transition-all duration-300 cursor-pointer border-gray-100 group flex flex-col items-center gap-3'
                >
                  <div className="transition-transform group-hover:scale-110 duration-300">
                    {Icon && <Icon className="w-8 h-8 text-primary" strokeWidth={1.5} />}
                  </div>
                  <span className="text-sm font-medium text-gray-600 group-hover:text-primary transition-colors">{item.title}</span>
                </div>
              )
            })}
          </div>
        </section>

        {/* Gray Container for Product Lists */}
        <div className="bg-[#FAFAFA] rounded-[24px] p-6 md:p-10 space-y-10 -mx-4 md:-mx-8 lg:-mx-12">

          {/* Featured Listings */}
          <section>
            <div className="mb-6">
              <h2 className="text-xl font-medium text-gray-900">Featured Listings</h2>
            </div>

            {featuredProducts.length === 0 && !loading ? (
              <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
                <Icons.Package className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No products found</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
                {featuredProducts.map((p) => (
                  <HomeProductCard key={p._id} product={p} />
                ))}
              </div>
            )}
          </section>

          {/* Previous Searches */}
          <section>
            <div className="mb-6">
              <h2 className="text-xl font-medium text-gray-900">Previous Searches</h2>
            </div>

            {featuredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
                {featuredProducts.slice(0, 4).map((p) => (
                  <HomeProductCard key={`prev-${p._id}`} product={p} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
                <p className="text-gray-400">No previous searches</p>
              </div>
            )}
          </section>

          {/* Dynamic Category Sections */}
          {sections.map((section) => (
            <section key={section.category._id}>
              <div className="mb-6">
                <h2 className="text-xl font-medium text-gray-900">Latest in {section.category.title}</h2>
              </div>

              {section.products.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
                  {section.products.map((p) => (
                    <HomeProductCard key={p._id} product={p} />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
                  <p className="text-gray-400">No products in this category</p>
                </div>
              )}
            </section>
          ))}
        </div>

      </div>

      {/* CTA Section */}
      <div className='w-full bg-primary py-16 flex flex-col gap-6 justify-center items-center text-center px-4 mt-12'>
        <h1 className='text-white text-3xl md:text-4xl font-semibold'>Ready to Sell?</h1>
        <p className='text-white/80 text-lg max-w-2xl'>Post your ad and reach thousands of buyers</p>
        <button
          onClick={handlePostAdButton}
          className='bg-white text-primary font-medium rounded-md px-8 py-3 shadow-lg hover:bg-gray-50 transition-colors'
        >
          Post Your Ad Now
        </button>
      </div>

      <Footer />

    </div>
  )
}