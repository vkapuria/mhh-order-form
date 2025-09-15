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
          <Link href="https://myhomeworkhelp.com" className="flex items-center">
            <img 
              src="/icons/Logo.png" 
              alt="MyHomeworkHelp" 
              className="h-8 w-auto"
            />
          </Link>

          {/* Navigation Menu */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="https://myhomeworkhelp.com/pricing/" 
              className="text-gray-700 hover:text-purple-600 font-medium transition-colors"
            >
              Prices
            </Link>
            
            <Link 
              href="https://myhomeworkhelp.com/experts/" 
              className="text-gray-700 hover:text-purple-600 font-medium transition-colors"
            >
              Our Writers
            </Link>
            
            <Link 
              href="https://myhomeworkhelp.com/how-it-works/" 
              className="text-gray-700 hover:text-purple-600 font-medium transition-colors"
            >
              How It Works
            </Link>
            
            <Link 
              href="https://myhomeworkhelp.com/student-reviews/" 
              className="text-gray-700 hover:text-purple-600 font-medium transition-colors"
            >
              Reviews
            </Link>
            
            <Link 
              href="https://myhomeworkhelp.com/blog/" 
              className="text-gray-700 hover:text-purple-600 font-medium transition-colors"
            >
              Blog
            </Link>
            
            <Link 
              href="https://myhomeworkhelp.com/faq/" 
              className="text-gray-700 hover:text-purple-600 font-medium transition-colors"
            >
              FAQ
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