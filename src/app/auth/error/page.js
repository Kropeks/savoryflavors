import Link from 'next/link';
import { ChefHat, ArrowLeft, AlertCircle, Home } from 'lucide-react';

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-olive-50 via-white to-olive-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-8 text-center">
          {/* Error Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>

          {/* Error Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Error</h1>

          {/* Error Message */}
          <p className="text-gray-600 mb-6">
            There was an issue with the authentication process. This might be because:
          </p>

          {/* Error Reasons */}
          <div className="text-left mb-6 space-y-2">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
              <span className="text-sm text-gray-600">Database connection not configured</span>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
              <span className="text-sm text-gray-600">Environment variables not set up</span>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
              <span className="text-sm text-gray-600">OAuth providers not configured</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link
              href="/auth/login"
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-olive-600 to-olive-700 hover:from-olive-700 hover:to-olive-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-olive-500 transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Link>

            <Link
              href="/"
              className="w-full flex justify-center items-center py-3 px-4 border border-olive-300 rounded-lg shadow-sm text-sm font-medium text-olive-700 bg-white hover:bg-olive-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-olive-500 transition-all duration-200"
            >
              <Home className="w-4 h-4 mr-2" />
              Go to Homepage
            </Link>
          </div>

          {/* Setup Instructions */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800 mb-2">Need to set up authentication?</h3>
            <p className="text-sm text-blue-700 mb-3">
              Check the setup guide in the project root:
            </p>
            <code className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
              savory-flavors/AUTH_SETUP.md
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}
