import Link from 'next/link'
import { ChefHat, Facebook, Twitter, Instagram, Youtube, Mail, MapPin, Phone } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  
  const footerLinks = [
    {
      title: 'Quick Links',
      links: [
        { name: 'Browse Recipes', href: '/recipes' },
        { name: 'Cuisines', href: '/cuisines' },
        { name: 'Popular Dishes', href: '/recipes?sort=popular' },
        { name: 'Latest Recipes', href: '/recipes?sort=newest' },
      ],
    },
    {
      title: 'Community',
      links: [
        { name: 'Forums', href: '/community/forums' },
        { name: 'Events', href: '/community/events' },
        { name: 'Blog', href: '/blog' },
        { name: 'Contribute', href: '/contribute' },
      ],
    },
    {
      title: 'Company',
      links: [
        { name: 'About Us', href: '/about' },
        { name: 'Contact', href: '/contact' },
        { name: 'Privacy Policy', href: '/privacy' },
        { name: 'Terms of Service', href: '/terms' },
      ],
    },
  ]

  return (
    <footer className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 text-gray-800 dark:text-white pt-16 pb-8 border-t border-gray-100 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          {/* Brand and description */}
          <div className="lg:col-span-4">
            <div className="flex items-center space-x-3 mb-6">
              <ChefHat className="h-8 w-8 text-green-600 dark:text-olive-400" />
              <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-500 dark:from-olive-400 dark:to-green-400 bg-clip-text text-transparent">
                SavoryFlavors
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Discover, save, and share amazing recipes from around the world. Join our community of food lovers and explore culinary delights.
            </p>
            
            <div className="space-y-3 mb-8">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-green-600 dark:text-olive-400 mt-0.5 flex-shrink-0" />
                <span className="text-gray-600 dark:text-gray-300">123 Culinary Street, Foodie City, FC 12345</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-green-600 dark:text-olive-400 flex-shrink-0" />
                <a href="mailto:hello@savoryflavors.com" className="text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-white transition-colors">
                  hello@savoryflavors.com
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-green-600 dark:text-olive-400 flex-shrink-0" />
                <span className="text-gray-600 dark:text-gray-300">+1 (555) 123-4567</span>
              </div>
            </div>

            <div className="flex space-x-4">
              <a href="#" className="text-gray-500 hover:text-green-600 dark:text-gray-300 dark:hover:text-olive-400 transition-colors" aria-label="Facebook">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-green-600 dark:text-gray-300 dark:hover:text-olive-400 transition-colors" aria-label="Twitter">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-green-600 dark:text-gray-300 dark:hover:text-olive-400 transition-colors" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-green-600 dark:text-gray-300 dark:hover:text-olive-400 transition-colors" aria-label="YouTube">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Footer links */}
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-8">
            {footerLinks.map((section) => (
              <div key={section.title}>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">{section.title}</h3>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <Link 
                        href={link.href}
                        className="text-gray-600 hover:text-green-600 dark:text-gray-300 dark:hover:text-olive-400 transition-colors text-sm"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 mt-12 pt-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              &copy; {currentYear} SavoryFlavors. All rights reserved.
            </p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
              Terms of Service
            </Link>
            <Link href="/sitemap" className="text-gray-400 hover:text-white text-sm transition-colors">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
