'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FaSearch, FaMapMarkerAlt, FaTools, FaCheckCircle, FaHome } from 'react-icons/fa';

export default function RoofersInGlasgow() {
  return (
    <div className="min-h-screen bg-gray-50">
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

        {/* Navigation Bar */}
        <div className="relative z-10">
          <nav className="bg-white/5 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-20">
                <div className="flex items-center">
                  <Link href="/" className="flex items-center">
                    <Image
                      src="/Roofer Near Me-2.png"
                      alt="Roofers Near Me Logo"
                      width={40}
                      height={40}
                      className="h-10 w-auto"
                    />
                    <span className="ml-3 text-2xl font-bold text-white">Roofers Near Me</span>
                  </Link>
                </div>
                <div>
                  <Link
                    href="/"
                    className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300"
                  >
                    Find a Roofer
                  </Link>
                </div>
              </div>
            </div>
          </nav>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 py-24 px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
              Trusted Roofers in Glasgow
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-12">
              Find reliable local roofing contractors in Glasgow and surrounding areas. Get quick responses and quality service for all your roofing needs.
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-yellow-400 text-black px-8 py-4 rounded-xl font-semibold hover:bg-yellow-500 transition-all duration-300 shadow-lg"
            >
              <FaSearch className="h-5 w-5" />
              <span>Find Glasgow Roofers</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Service Areas */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Areas We Cover in Glasgow</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              'Glasgow City Centre',
              'Paisley',
              'Clydebank',
              'Dumbarton',
              'East Kilbride',
              'Bearsden',
              'Milngavie',
              'Bishopbriggs',
              'Kirkintilloch',
              'Rutherglen',
              'Cambuslang',
              'Hamilton'
            ].map((area) => (
              <div key={area} className="bg-gray-50 rounded-lg p-4 text-center hover:bg-gray-100 transition-colors duration-300">
                <FaMapMarkerAlt className="h-5 w-5 text-yellow-500 mx-auto mb-2" />
                <span className="text-gray-900">{area}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Roofing Services in Glasgow</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="bg-yellow-400 rounded-full p-3 w-12 h-12 flex items-center justify-center mb-6">
                <FaTools className="h-6 w-6 text-black" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Roof Repairs</h3>
              <ul className="space-y-3 text-gray-600">
                <li>• Emergency leak repairs</li>
                <li>• Tile and slate replacement</li>
                <li>• Chimney repairs</li>
                <li>• Ridge tile repointing</li>
              </ul>
            </div>
            
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="bg-yellow-400 rounded-full p-3 w-12 h-12 flex items-center justify-center mb-6">
                <FaHome className="h-6 w-6 text-black" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">New Roofs</h3>
              <ul className="space-y-3 text-gray-600">
                <li>• Complete roof replacements</li>
                <li>• Slate and tile roofing</li>
                <li>• Flat roof installations</li>
                <li>• Lead work</li>
              </ul>
            </div>
            
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="bg-yellow-400 rounded-full p-3 w-12 h-12 flex items-center justify-center mb-6">
                <FaCheckCircle className="h-6 w-6 text-black" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Maintenance</h3>
              <ul className="space-y-3 text-gray-600">
                <li>• Roof inspections</li>
                <li>• Gutter cleaning</li>
                <li>• Moss removal</li>
                <li>• Preventative maintenance</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Why Choose Our Glasgow Roofers?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-50 rounded-xl p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Local Expertise</h3>
              <p className="text-gray-600 mb-6">
                Our network of Glasgow roofers brings extensive local experience and understanding of Scottish weather conditions and building regulations.
              </p>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">•</span>
                  <span>Deep knowledge of local architecture</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">•</span>
                  <span>Understanding of Glasgow&apos;s weather challenges</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">•</span>
                  <span>Compliance with Scottish building standards</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Quality Assurance</h3>
              <p className="text-gray-600 mb-6">
                All our Glasgow roofers are thoroughly vetted and must maintain high standards of workmanship.
              </p>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">•</span>
                  <span>Fully insured and qualified contractors</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">•</span>
                  <span>Regular quality assessments</span>
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">•</span>
                  <span>Customer satisfaction guarantee</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Need a Roofer in Glasgow?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Get connected with trusted local roofers who can help with your roofing needs today.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-yellow-400 text-black px-8 py-4 rounded-xl font-semibold hover:bg-yellow-500 transition-all duration-300 shadow-lg"
          >
            <FaSearch className="h-5 w-5" />
            <span>Find a Roofer</span>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Image
            src="/Roofer Near Me-2.png"
            alt="Roofers Near Me Logo"
            width={40}
            height={40}
            className="mx-auto mb-4"
          />
          <p className="text-gray-400 text-sm">
            Saunders Simmons Ltd | Registered in England and Wales<br />
            © {new Date().getFullYear()} Roofers Near Me - A Saunders Simmons Ltd Service
          </p>
        </div>
      </footer>
    </div>
  );
} 