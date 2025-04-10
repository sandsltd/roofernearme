'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaBuilding, FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt, FaCheck, FaHome, FaBars, FaTimes } from 'react-icons/fa';
import Image from 'next/image';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Breadcrumbs from '../../components/Breadcrumbs';

interface FormData {
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  website: string;
  location: string;
}

export default function RecommendPage() {
  const [formData, setFormData] = useState<FormData>({
    businessName: '',
    contactName: '',
    email: '',
    phone: '',
    website: '',
    location: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [currentYear, setCurrentYear] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  useEffect(() => {
    setCurrentYear(new Date().getFullYear().toString());
  }, []);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit form');
      }

      setIsSubmitted(true);
      setFormData({
        businessName: '',
        contactName: '',
        email: '',
        phone: '',
        website: '',
        location: '',
      });
    } catch {
      setError('Failed to submit form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Define breadcrumb items
  const breadcrumbItems = [
    { label: 'Recommend a Roofer' }
  ];
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />
      
      {/* Breadcrumbs - now below the header */}
      <div className="bg-gray-100 py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={breadcrumbItems} />
        </div>
      </div>
      
      {/* Hero Section with Map Background */}
      <div className="relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/Untitled design-16.png')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 via-blue-900/10 to-blue-900/30" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 py-24 px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
              Recommend a Roofer
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
              Know a great local roofer? Help us expand our network and connect more homeowners with trusted professionals.
            </p>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20 pb-24">
        <div className="bg-white rounded-2xl shadow-2xl p-8 backdrop-blur-lg">
          {!isSubmitted ? (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-8">
                Roofer Details
              </h2>
              
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-lg">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="businessName" className="block text-lg font-medium text-gray-900 mb-2">
                    Business Name *
                  </label>
                  <div className="mt-1">
                    <div className="flex rounded-xl shadow-sm ring-1 ring-inset ring-gray-300 hover:ring-2 hover:ring-yellow-400 focus-within:ring-2 focus-within:ring-yellow-400 transition-all duration-300">
                      <span className="flex select-none items-center px-4 text-gray-500">
                        <FaBuilding className="h-5 w-5" />
                      </span>
                      <input
                        type="text"
                        name="businessName"
                        id="businessName"
                        className="block flex-1 border-0 bg-transparent py-4 pl-2 pr-4 text-gray-900 placeholder:text-gray-500 focus:ring-0 sm:text-sm sm:leading-6 rounded-xl"
                        placeholder="Apex Roofing Services"
                        value={formData.businessName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="contactName" className="block text-lg font-medium text-gray-900 mb-2">
                    Contact Name *
                  </label>
                  <div className="mt-1">
                    <div className="flex rounded-xl shadow-sm ring-1 ring-inset ring-gray-300 hover:ring-2 hover:ring-yellow-400 focus-within:ring-2 focus-within:ring-yellow-400 transition-all duration-300">
                      <span className="flex select-none items-center px-4 text-gray-500">
                        <FaUser className="h-5 w-5" />
                      </span>
                      <input
                        type="text"
                        name="contactName"
                        id="contactName"
                        className="block flex-1 border-0 bg-transparent py-4 pl-2 pr-4 text-gray-900 placeholder:text-gray-500 focus:ring-0 sm:text-sm sm:leading-6 rounded-xl"
                        placeholder="James Wilson"
                        value={formData.contactName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-lg font-medium text-gray-900 mb-2">
                    Phone Number *
                  </label>
                  <div className="mt-1">
                    <div className="flex rounded-xl shadow-sm ring-1 ring-inset ring-gray-300 hover:ring-2 hover:ring-yellow-400 focus-within:ring-2 focus-within:ring-yellow-400 transition-all duration-300">
                      <span className="flex select-none items-center px-4 text-gray-500">
                        <FaPhone className="h-5 w-5" />
                      </span>
                      <input
                        type="tel"
                        name="phone"
                        id="phone"
                        className="block flex-1 border-0 bg-transparent py-4 pl-2 pr-4 text-gray-900 placeholder:text-gray-500 focus:ring-0 sm:text-sm sm:leading-6 rounded-xl"
                        placeholder="07712 345678"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-lg font-medium text-gray-900 mb-2">
                    Email Address *
                  </label>
                  <div className="mt-1">
                    <div className="flex rounded-xl shadow-sm ring-1 ring-inset ring-gray-300 hover:ring-2 hover:ring-yellow-400 focus-within:ring-2 focus-within:ring-yellow-400 transition-all duration-300">
                      <span className="flex select-none items-center px-4 text-gray-500">
                        <FaEnvelope className="h-5 w-5" />
                      </span>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        className="block flex-1 border-0 bg-transparent py-4 pl-2 pr-4 text-gray-900 placeholder:text-gray-500 focus:ring-0 sm:text-sm sm:leading-6 rounded-xl"
                        placeholder="info@apexroofing.co.uk"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="location" className="block text-lg font-medium text-gray-900 mb-2">
                    Location/Coverage Areas *
                  </label>
                  <div className="mt-1">
                    <div className="flex rounded-xl shadow-sm ring-1 ring-inset ring-gray-300 hover:ring-2 hover:ring-yellow-400 focus-within:ring-2 focus-within:ring-yellow-400 transition-all duration-300">
                      <span className="flex select-none items-center px-4 text-gray-500">
                        <FaMapMarkerAlt className="h-5 w-5" />
                      </span>
                      <input
                        type="text"
                        name="location"
                        id="location"
                        className="block flex-1 border-0 bg-transparent py-4 pl-2 pr-4 text-gray-900 placeholder:text-gray-500 focus:ring-0 sm:text-sm sm:leading-6 rounded-xl"
                        placeholder="Southampton, Portsmouth, Eastleigh"
                        value={formData.location}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </div>
                
                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 bg-yellow-400 text-black px-6 py-4 rounded-xl font-semibold hover:bg-yellow-500 transition-all duration-300 shadow-lg disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-black border-t-transparent" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <FaBuilding className="h-5 w-5" />
                        <span>Submit Recommendation</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="bg-green-50 rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-6">
                <FaCheck className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Recommendation Submitted</h2>
              <p className="text-gray-600">
                We&apos;re always looking to expand our network with reliable professionals.
              </p>
              <Link 
                href="/"
                className="inline-flex items-center justify-center gap-2 bg-yellow-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-500 transition-all duration-300 shadow-md"
              >
                <FaHome className="h-5 w-5" />
                <span>Return to Home</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
} 