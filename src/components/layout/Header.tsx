'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'

export default function Header() {
  const [servicesOpen, setServicesOpen] = useState(false)

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-10">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo - Using your actual logo */}
          <Link href="https://domyhomework.co" className="flex items-center">
            <img 
              src="/icons/Logo.png" 
              alt="DoMyHomework" 
              className="h-8 w-auto"
            />
          </Link>

          {/* Navigation Menu */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="https://domyhomework.co/top-writers/" 
              className="text-gray-700 hover:text-purple-600 font-medium transition-colors"
            >
              Writers
            </Link>
            
            <Link 
              href="https://domyhomework.co/pricing/" 
              className="text-gray-700 hover:text-purple-600 font-medium transition-colors"
            >
              Pricing
            </Link>
            
            <Link 
              href="https://domyhomework.co/reviews/" 
              className="text-gray-700 hover:text-purple-600 font-medium transition-colors"
            >
              Reviews
            </Link>
            
            <Link 
              href="https://domyhomework.co/faq/" 
              className="text-gray-700 hover:text-purple-600 font-medium transition-colors"
            >
              FAQ
            </Link>
            
            <Link 
              href="https://domyhomework.co/blog/" 
              className="text-gray-700 hover:text-purple-600 font-medium transition-colors"
            >
              Blog
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button className="text-gray-700 p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}