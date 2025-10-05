'use client';

import { usePathname } from 'next/navigation';
import ConditionalHeader from '@/components/ConditionalHeader';

export default function SiteShell({ children }) {
  const pathname = usePathname();
  const hideGlobalChrome = pathname?.startsWith('/admin') || pathname?.startsWith('/auth');
  const hideFooter = hideGlobalChrome || pathname === '/profile';

  return (
    <div className="min-h-screen flex flex-col">
      {!hideGlobalChrome && <ConditionalHeader />}
      <main
        id="main-content"
        className={`flex-grow${hideGlobalChrome ? '' : ' pt-16 md:pt-20'}`}
      >
        {children}
      </main>

      {!hideFooter && (
        <footer className="bg-white dark:bg-gray-900 border-t border-soft-200 dark:border-gray-700 mt-auto">
          <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-sm font-semibold text-olive-800 dark:text-gray-100 tracking-wider uppercase">SavoryFlavors</h3>
                <p className="mt-4 text-sm text-olive-700 dark:text-gray-300">Discover and share amazing recipes from around the world.</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-olive-800 dark:text-gray-100 tracking-wider uppercase">Explore</h4>
                <ul className="mt-4 space-y-2">
                  <li><a href="/recipes" className="text-sm text-olive-700 dark:text-gray-300 hover:text-olive-600 dark:hover:text-olive-400 transition-colors">All Recipes</a></li>
                  <li><a href="/categories" className="text-sm text-olive-700 dark:text-gray-300 hover:text-olive-600 dark:hover:text-olive-400 transition-colors">Categories</a></li>
                  <li><a href="/cuisines" className="text-sm text-olive-700 dark:text-gray-300 hover:text-olive-600 dark:hover:text-olive-400 transition-colors">Cuisines</a></li>
                  <li><a href="/popular" className="text-sm text-olive-700 dark:text-gray-300 hover:text-olive-600 dark:hover:text-olive-400 transition-colors">Popular</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-olive-800 dark:text-gray-100 tracking-wider uppercase">Community</h4>
                <ul className="mt-4 space-y-2">
                  <li><a href="/community/recipes" className="text-sm text-olive-700 dark:text-gray-300 hover:text-olive-600 dark:hover:text-olive-400 transition-colors">Community Recipes</a></li>
                  <li><a href="/blog" className="text-sm text-olive-700 dark:text-gray-300 hover:text-olive-600 dark:hover:text-olive-400 transition-colors">Blog</a></li>
                  <li><a href="/about" className="text-sm text-olive-700 dark:text-gray-300 hover:text-olive-600 dark:hover:text-olive-400 transition-colors">About Us</a></li>
                  <li><a href="/contact" className="text-sm text-olive-700 dark:text-gray-300 hover:text-olive-600 dark:hover:text-olive-400 transition-colors">Contact</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-olive-800 dark:text-gray-100 tracking-wider uppercase">Legal</h4>
                <ul className="mt-4 space-y-2">
                  <li><a href="/privacy" className="text-sm text-olive-700 dark:text-gray-300 hover:text-olive-600 dark:hover:text-olive-400 transition-colors">Privacy Policy</a></li>
                  <li><a href="/terms" className="text-sm text-olive-700 dark:text-gray-300 hover:text-olive-600 dark:hover:text-olive-400 transition-colors">Terms of Service</a></li>
                  <li><a href="/cookies" className="text-sm text-olive-700 dark:text-gray-300 hover:text-olive-600 dark:hover:text-olive-400 transition-colors">Cookie Policy</a></li>
                </ul>
              </div>
            </div>
            <div className="mt-8 border-t border-soft-200 dark:border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm text-olive-600 dark:text-gray-400">&copy; {new Date().getFullYear()} SavoryFlavors. All rights reserved.</p>
              <div className="mt-4 md:mt-0 flex space-x-6">
                <a href="#" className="text-olive-600 dark:text-gray-300 hover:text-olive-500 dark:hover:text-olive-400 transition-colors" aria-label="Facebook">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-olive-600 dark:text-gray-300 hover:text-olive-500 dark:hover:text-olive-400 transition-colors" aria-label="Instagram">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-olive-600 dark:text-gray-300 hover:text-olive-500 dark:hover:text-olive-400 transition-colors" aria-label="Pinterest">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.53.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
