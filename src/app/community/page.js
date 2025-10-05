'use client';

import { useAuthModal } from '@/components/AuthProvider';
import Link from 'next/link';
import { Suspense } from 'react';
import { MoreHorizontal, Heart, MessageSquare, Share2, Bookmark } from 'lucide-react';

// Mock data - replace with actual API calls
const posts = [
  {
    id: 1,
    user: {
      name: 'Jamie Oliver',
      avatar: '/avatars/chef1.jpg',
      username: '@jamieoliver',
    },
    content: 'Just made this amazing pasta dish with fresh basil from my garden! 🍝 #HomeCooking #ItalianFood',
    image: '/images/community/pasta.jpg',
    likes: 124,
    comments: 32,
    shares: 12,
    timeAgo: '2h ago',
  },
  {
    id: 2,
    user: {
      name: 'Gordon Ramsay',
      avatar: '/avatars/chef2.jpg',
      username: '@gordonramsay',
    },
    content: 'Perfecting my beef wellington recipe for the weekend. What\'s everyone else cooking? #CookingAdventures',
    image: '/images/community/beef-wellington.jpg',
    likes: 542,
    comments: 87,
    shares: 45,
    timeAgo: '5h ago',
  },
];

const trendingRecipes = [
  { id: 1, name: 'Avocado Toast', likes: 1243, image: '/images/recipes/avocado-toast.jpg' },
  { id: 2, name: 'Chocolate Lava Cake', likes: 987, image: '/images/recipes/chocolate-cake.jpg' },
  { id: 3, name: 'Vegan Buddha Bowl', likes: 765, image: '/images/recipes/buddha-bowl.jpg' },
];

function PostCard({ post }) {
  const { requireAuth } = useAuthModal();
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-6 border border-gray-100 dark:border-gray-700">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
              <img
                src={post.user.avatar}
                alt={post.user.name}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = '<div class="h-full w-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-sm">' + post.user.name.charAt(0) + '</div>';
                }}
              />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">{post.user.name}</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">{post.user.username} · {post.timeAgo}</p>
            </div>
          </div>
          <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>
        <p className="text-gray-800 dark:text-gray-100 mb-4">{post.content}</p>
        {post.image && (
          <div className="rounded-lg overflow-hidden mb-4">
            <img
              src={post.image}
              alt="Post content"
              className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}
        <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 text-sm">
          <div className="flex space-x-4">
            <button 
              className="flex items-center space-x-1 hover:text-red-500"
              onClick={() => {
                if (requireAuth('like posts and interact with community')) {
                  // Handle like functionality here
                  console.log('Liked post:', post.id);
                }
              }}
            >
              <Heart className="h-5 w-5" />
              <span>{post.likes}</span>
            </button>
            <button className="flex items-center space-x-1 hover:text-blue-500">
              <MessageSquare className="h-5 w-5" />
              <span>{post.comments}</span>
            </button>
            <button className="flex items-center space-x-1 hover:text-green-500">
              <Share2 className="h-5 w-5" />
              <span>{post.shares}</span>
            </button>
          </div>
          <button className="hover:text-yellow-500">
            <Bookmark className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default CommunityPage;

function CreatePost() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-6 border border-gray-100 dark:border-gray-700">
      <div className="p-4">
        <div className="flex items-start space-x-3">
          <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
          <div className="flex-1">
            <input
              type="text"
              placeholder="What's cooking? Share your recipe..."
              className="w-full bg-gray-50 dark:bg-gray-700 rounded-full px-4 py-2 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
        <div className="flex justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="flex space-x-2">
            <button className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-1.5 rounded-full text-sm">
              <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Photo</span>
            </button>
          </div>
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-full text-sm font-medium">
            Post
          </button>
        </div>
      </div>
    </div>
  );
}

function CommunityPage() {
  const { requireAuth } = useAuthModal();
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Main content */}
          <div className="md:w-2/3">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Community Feed</h1>
            
            <CreatePost />
            
            <Suspense fallback={<div>Loading posts...</div>}>
              <div className="space-y-6">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </Suspense>
          </div>
          
          {/* Sidebar */}
          <div className="md:w-1/3 space-y-6">
            {/* Trending Recipes */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700">
              <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Trending Recipes</h3>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {trendingRecipes.map((recipe) => (
                  <Link key={recipe.id} href={`/recipes/${recipe.id}`} className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 rounded-md overflow-hidden bg-gray-200 dark:bg-gray-600">
                        <img
                          src={recipe.image}
                          alt={recipe.name}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = '<div class="h-full w-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-xs">' + recipe.name.charAt(0) + '</div>';
                          }}
                        />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{recipe.name}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{recipe.likes} likes</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
            
            {/* Suggested to Follow */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700">
              <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Suggested Chefs</h3>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-600"></div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">Chef Name {i}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">@chefname{i}</p>
                      </div>
                    </div>
                    <button className="text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300">
                      Follow
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Community Guidelines */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700 p-4 text-sm text-gray-600 dark:text-gray-300 space-y-2">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Community Guidelines</h3>
              <p>• Be respectful and kind to others</p>
              <p>• Share your own original content</p>
              <p>• Give credit when using others' recipes</p>
              <p>• No spam or self-promotion</p>
              <p>• Report any inappropriate content</p>
              <Link href="/community/guidelines" className="inline-block text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 text-sm mt-2">
                Read full guidelines
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
