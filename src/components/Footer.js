'use client'

import Link from 'next/link'
import { useCallback } from 'react'
import { ChefHat, Mail, MapPin, Phone } from 'lucide-react'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const handleContactSubmit = useCallback((event) => {
    event.preventDefault()
  }, [])

  const footerLinks = [
    {
      title: 'Explore',
      links: [
        { name: 'Recipes', href: '/recipes' },
        { name: 'Cuisines', href: '/cuisines' },
        { name: 'Favorites', href: '/favorites' },
        { name: 'Community', href: '/community' },
      ],
    },
    {
      title: 'Company',
      links: [
        { name: 'About Us', href: '/about' },
        { name: 'Contact', modal: 'contact' },
        { name: 'Privacy Policy', modal: 'privacy' },
        { name: 'Terms of Service', modal: 'terms' },
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

            <div className="hidden" />
          </div>

          {/* Footer links */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-8">
            {footerLinks.map((section) => (
              <div key={section.title}>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">{section.title}</h3>
                <ul className={`${section.title === 'Explore' ? 'space-y-2' : 'space-y-3'}`}>
                  {section.links.map((link) => (
                    <li key={link.name} className={section.title === 'Explore' ? 'text-sm' : ''}>
                      {link.href ? (
                        <Link
                          href={link.href}
                          className="text-gray-600 hover:text-green-600 dark:text-gray-300 dark:hover:text-olive-400 transition-colors text-sm"
                        >
                          {link.name}
                        </Link>
                      ) : link.modal ? (
                        <Dialog>
                          <DialogTrigger asChild>
                            <button className="text-left text-gray-600 hover:text-green-600 dark:text-gray-300 dark:hover:text-olive-400 transition-colors text-sm w-full">
                              {link.name}
                            </button>
                          </DialogTrigger>
                          <DialogContent className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                            {link.modal === 'contact' && (
                              <>
                                <DialogHeader>
                                  <DialogTitle>Contact our team</DialogTitle>
                                  <DialogDescription>
                                    Tell us what you need and we&rsquo;ll get back to you within one business day.
                                  </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleContactSubmit} className="space-y-4">
                                  <div>
                                    <label htmlFor="footer-contact-name" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                                      Name
                                    </label>
                                    <input
                                      id="footer-contact-name"
                                      type="text"
                                      required
                                      className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-olive-500 focus:border-transparent"
                                      placeholder="Jane Doe"
                                    />
                                  </div>
                                  <div>
                                    <label htmlFor="footer-contact-email" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                                      Email
                                    </label>
                                    <input
                                      id="footer-contact-email"
                                      type="email"
                                      required
                                      className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-olive-500 focus:border-transparent"
                                      placeholder="you@example.com"
                                    />
                                  </div>
                                  <div>
                                    <label htmlFor="footer-contact-message" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                                      Message
                                    </label>
                                    <textarea
                                      id="footer-contact-message"
                                      rows={4}
                                      required
                                      className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-olive-500 focus:border-transparent"
                                      placeholder="How can we help?"
                                    />
                                  </div>
                                  <DialogFooter className="sm:flex-row sm:justify-end">
                                    <DialogClose asChild>
                                      <button
                                        type="button"
                                        className="rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                      >
                                        Cancel
                                      </button>
                                    </DialogClose>
                                    <DialogClose asChild>
                                      <button
                                        type="submit"
                                        className="ml-0 sm:ml-3 rounded-md bg-olive-600 px-4 py-2 text-sm font-semibold text-white hover:bg-olive-700 transition-colors"
                                      >
                                        Send message
                                      </button>
                                    </DialogClose>
                                  </DialogFooter>
                                </form>
                              </>
                            )}
                            {link.modal === 'privacy' && (
                              <>
                                <DialogHeader>
                                  <DialogTitle>Privacy Policy Overview</DialogTitle>
                                  <DialogDescription>
                                    Learn how we collect, use, and safeguard your personal information.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-3 text-sm text-gray-700 dark:text-gray-200">
                                  <p>
                                    We only collect the data we need to deliver a personalized, secure cooking experience. This includes your account details, saved recipes, and activity within SavoryFlavors.
                                  </p>
                                  <p>
                                    Your information is never sold. We may share aggregated insights with partners, but those reports cannot be used to identify you.
                                  </p>
                                  <p>
                                    You can request, update, or delete your data at any time by contacting our team.
                                  </p>
                                </div>
                                <DialogFooter className="justify-end">
                                  <DialogClose asChild>
                                    <button className="rounded-md bg-olive-600 px-4 py-2 text-sm font-semibold text-white hover:bg-olive-700 transition-colors">
                                      Got it
                                    </button>
                                  </DialogClose>
                                </DialogFooter>
                              </>
                            )}
                            {link.modal === 'terms' && (
                              <>
                                <DialogHeader>
                                  <DialogTitle>Terms of Service Snapshot</DialogTitle>
                                  <DialogDescription>
                                    Understand the guidelines that keep our community welcoming and trustworthy.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-3 text-sm text-gray-700 dark:text-gray-200">
                                  <p>
                                    By using SavoryFlavors you agree to share respectful, original content and to comply with applicable laws.
                                  </p>
                                  <p>
                                    Premium features and subscriptions are billed on a recurring basis. You can cancel anytime to stop future charges.
                                  </p>
                                  <p>
                                    We may update these terms to reflect new features. Continued use of the site means you accept the latest version.
                                  </p>
                                </div>
                                <DialogFooter className="justify-end">
                                  <DialogClose asChild>
                                    <button className="rounded-md bg-olive-600 px-4 py-2 text-sm font-semibold text-white hover:bg-olive-700 transition-colors">
                                      Close
                                    </button>
                                  </DialogClose>
                                </DialogFooter>
                              </>
                            )}
                          </DialogContent>
                        </Dialog>
                      ) : (
                        <span className="text-gray-600 dark:text-gray-300 text-sm">{link.name}</span>
                      )}
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
      </div>
    </footer>
  )
}
