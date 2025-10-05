'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  Activity,
  Bookmark,
  ChevronRight,
  Crown,
  Heart,
  MessageSquare,
  Pencil,
  Settings,
  ShieldCheck,
  Sparkles,
  Utensils,
} from 'lucide-react';

import { useFavorites } from '@/context/FavoritesContext';
import { isAuthDisabled, useMockableSession } from '@/lib/auth-utils';

const managementActions = [
  {
    key: 'edit-profile',
    title: 'Edit profile',
    description: 'Update your display name, avatar, and bio.',
    icon: Pencil,
  },
  {
    key: 'account-security',
    title: 'Account security',
    description: 'Manage password, two-factor authentication, and devices.',
    icon: ShieldCheck,
  },
  {
    key: 'preferences',
    title: 'Preferences',
    description: 'Control notifications, dietary preferences, and privacy.',
    icon: Settings,
  },
];

function formatActivityDate(dateString) {
  if (!dateString) return 'Recently';
  const parsed = new Date(dateString);
  if (Number.isNaN(parsed.getTime())) return 'Recently';
  return parsed.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function ProfileHeader({ session }) {
  const userName = session?.user?.name ?? 'SavoryFlavors Member';
  const initials = userName
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
    
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const response = await fetch('/api/user/subscription');
        const data = await response.json();
        if (response.ok) {
          setSubscription(data.status === 'active' ? data : null);
        }
      } catch (error) {
        console.error('Error checking subscription:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (session) {
      checkSubscription();
    }
  }, [session]);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-olive-600 to-emerald-500 text-white">
      <div className="absolute inset-0 opacity-30">
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <defs>
            <linearGradient id="profile-grid-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.35)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#profile-grid-gradient)" />
          <g stroke="rgba(255,255,255,0.15)" strokeWidth="1">
            {Array.from({ length: 12 }).map((_, index) => (
              <line key={`h-${index}`} x1="0" y1={`${index * 60}`} x2="100%" y2={`${index * 60}`} />
            ))}
            {Array.from({ length: 12 }).map((_, index) => (
              <line key={`v-${index}`} x1={`${index * 60}`} y1="0" x2={`${index * 60}`} y2="100%" />
            ))}
          </g>
        </svg>
      </div>

      <div className="relative flex flex-col gap-6 p-8 md:flex-row md:items-end md:justify-between md:p-12">
        <div className="flex items-center gap-6">
          <div className="relative h-24 w-24 rounded-full border-4 border-white/40 bg-white/10 shadow-xl">
            {session?.user?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={session.user.image}
                alt={userName}
                className="h-full w-full rounded-full object-cover"
                onError={(event) => {
                  event.currentTarget.style.display = 'none';
                  event.currentTarget.nextElementSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div className={`absolute inset-0 ${session?.user?.image ? 'hidden' : 'flex'} items-center justify-center rounded-full bg-white/20 text-3xl font-semibold`}> 
              {initials || 'SF'}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm uppercase tracking-wider text-white/75">Member profile</p>
              {!loading && subscription && (
                <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 px-2.5 py-0.5 text-xs font-medium text-amber-900">
                  <Sparkles className="h-3 w-3" />
                  Premium
                </span>
              )}
            </div>
            <h1 className="mt-2 text-3xl font-semibold md:text-4xl">
              {userName}
            </h1>
            <p className="mt-2 text-white/80">{session?.user?.email ?? 'No email on file'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { data: session, status } = useMockableSession(useSession);
  const router = useRouter();
  const { favorites = [], removeFromFavorites, loading: favoritesLoading } = useFavorites();
  const [mounted, setMounted] = useState(false);
  const [personalRecipes, setPersonalRecipes] = useState([]);
  const [loadingPersonalRecipes, setLoadingPersonalRecipes] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!session?.user) {
      setPersonalRecipes([]);
      return;
    }

    const loadPersonalRecipes = async () => {
      try {
        setLoadingPersonalRecipes(true);
        const response = await fetch('/api/recipes?mine=true');
        if (!response.ok) {
          console.warn('Failed to load personal recipes from API', await response.text());
          setPersonalRecipes([]);
          return;
        }

        const data = await response.json();
        setPersonalRecipes(Array.isArray(data.recipes) ? data.recipes : []);
      } catch (error) {
        console.error('Failed to load personal recipes from API', error);
        setPersonalRecipes([]);
      } finally {
        setLoadingPersonalRecipes(false);
      }
    };

    loadPersonalRecipes();
  }, [mounted, session]);

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthDisabled && status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/profile');
    }
  }, [mounted, router, status]);

  const communityPosts = useMemo(() => {
    if (!session) return [];

    return [
      {
        id: 'community-post-1',
        title: 'My go-to weeknight pasta',
        createdAt: '2 days ago',
        likes: 42,
        comments: 7,
        excerpt: 'A quick, comforting pasta dish ready in under 20 minutes with pantry staples.',
        coverImage: '/images/community/pasta.jpg',
      },
      {
        id: 'community-post-2',
        title: '5 ingredient breakfast tacos',
        createdAt: '1 week ago',
        likes: 31,
        comments: 4,
        excerpt: 'Soft tortillas, fluffy eggs, crispy potatoes, and a bright salsa verde.',
        coverImage: '/images/community/beef-wellington.jpg',
      },
    ];
  }, [session]);

  const activities = useMemo(() => {
    const items = [];

    favorites.slice(0, 4).forEach((recipe) => {
      items.push({
        id: `favorite-${recipe.id}`,
        title: 'Saved to favorites',
        description: recipe.title ?? 'Untitled recipe',
        time: formatActivityDate(recipe.dateAdded),
      });
    });

    personalRecipes.slice(0, 4).forEach((recipe) => {
      items.push({
        id: `personal-${recipe.id}`,
        title: 'Created a new recipe',
        description: recipe.title ?? 'Untitled recipe',
        time: formatActivityDate(recipe.createdAt),
      });
    });

    if (!items.length) {
      return [
        {
          id: 'empty-activity',
          title: 'No recent activity yet',
          description: 'Start saving recipes or add your own creations to see them here.',
          time: '—',
          isEmpty: true,
        },
      ];
    }

    return items.slice(0, 6);
  }, [favorites, personalRecipes]);

  const stats = useMemo(
    () => [
      {
        key: 'favorites',
        label: 'Favorite recipes',
        value: favorites.length,
        description: 'Recipes you loved the most',
        icon: Heart,
        accent: 'bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300',
      },
      {
        key: 'personal',
        label: 'Personal recipes',
        value: personalRecipes.length,
        description: 'Creations stored on this device',
        icon: Utensils,
        accent: 'bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300',
      },
      {
        key: 'community',
        label: 'Community posts',
        value: communityPosts.length,
        description: 'Shared with fellow food lovers',
        icon: Activity,
        accent: 'bg-sky-100 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300',
      },
    ],
    [favorites.length, personalRecipes.length, communityPosts.length],
  );

  if (!mounted || status === 'loading' || favoritesLoading || loadingPersonalRecipes) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-olive-500 border-t-transparent" />
      </div>
    );
  }

  if (!session && !isAuthDisabled) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16 pt-10 dark:bg-gray-950">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 sm:px-6 lg:px-8">
        <ProfileHeader session={session} />

        <section>
          <h2 className="text-xl font-semibold text-olive-900 dark:text-gray-100">At a glance</h2>
          <p className="mt-1 text-sm text-olive-600 dark:text-gray-400">
            Keep track of your culinary footprint across SavoryFlavors.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {stats.map((stat) => (
              <div
                key={stat.key}
                className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-olive-100/60 transition hover:-translate-y-0.5 hover:shadow-md dark:bg-gray-900 dark:ring-gray-800"
              >
                <div className={`mb-4 inline-flex rounded-full ${stat.accent} p-3`}>{<stat.icon className="h-5 w-5" />}</div>
                <p className="text-sm font-medium uppercase tracking-wide text-olive-500 dark:text-gray-400">
                  {stat.label}
                </p>
                <p className="mt-3 text-3xl font-semibold text-olive-900 dark:text-gray-100">{stat.value}</p>
                <p className="mt-2 text-sm text-olive-600 dark:text-gray-400">{stat.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-olive-900 dark:text-gray-100">Saved favorites</h2>
              <p className="mt-1 text-sm text-olive-600 dark:text-gray-400">
                A quick look at recipes you loved recently.
              </p>
            </div>
            <Link
              href="/favorites"
              className="inline-flex items-center gap-1 rounded-full bg-olive-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-olive-700"
            >
              View all
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {favorites.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-olive-200 bg-white/60 p-8 text-center dark:border-gray-800 dark:bg-gray-900/60">
              <Heart className="mx-auto h-10 w-10 text-olive-400" />
              <p className="mt-4 text-lg font-medium text-olive-900 dark:text-gray-100">No favorites just yet</p>
              <p className="mt-2 text-sm text-olive-600 dark:text-gray-400">
                Explore the recipe library and tap the heart icon to save dishes for later.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {favorites.slice(0, 3).map((recipe) => (
                <article
                  key={recipe.id}
                  className="group flex h-full flex-col rounded-2xl bg-white shadow-sm ring-1 ring-olive-100/60 transition hover:-translate-y-1 hover:shadow-lg dark:bg-gray-900 dark:ring-gray-800"
                >
                  <div className="relative h-48 overflow-hidden rounded-t-2xl bg-olive-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={recipe.image || '/placeholder-recipe.jpg'}
                      alt={recipe.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      onError={(event) => {
                        event.currentTarget.src = '/placeholder-recipe.jpg';
                      }}
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-4 p-5">
                    <div>
                      <h3 className="text-lg font-semibold text-olive-900 dark:text-gray-100">{recipe.title}</h3>
                      <p className="mt-2 text-sm text-olive-600 dark:text-gray-400 line-clamp-2">
                        {recipe.description || 'No description provided yet.'}
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-sm text-olive-500 dark:text-gray-400">
                      <span>{formatActivityDate(recipe.dateAdded)}</span>
                      <button
                        type="button"
                        onClick={() => removeFromFavorites(recipe.id)}
                        className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-3 py-1 font-medium text-rose-600 transition hover:bg-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:hover:bg-rose-500/20"
                      >
                        <Heart className="h-4 w-4" />
                        Remove
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-olive-900 dark:text-gray-100">Personal recipe box</h2>
                <p className="mt-1 text-sm text-olive-600 dark:text-gray-400">
                  Recipes you have created in SavoryFlavors.
                </p>
              </div>
            </div>

            {personalRecipes.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-olive-200 bg-white/60 p-8 text-center dark:border-gray-800 dark:bg-gray-900/60">
                <Utensils className="mx-auto h-10 w-10 text-olive-400" />
                <p className="mt-4 text-lg font-medium text-olive-900 dark:text-gray-100">No personal recipes yet</p>
                <p className="mt-2 text-sm text-olive-600 dark:text-gray-400">
                  Create a recipe to see it appear in your personal collection.
                </p>
              </div>
            ) : (
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {personalRecipes.slice(0, 4).map((recipe) => (
                  <article
                    key={recipe.id}
                    className="flex h-full flex-col rounded-2xl bg-white p-5 shadow-sm ring-1 ring-olive-100/60 transition hover:-translate-y-1 hover:shadow-lg dark:bg-gray-900 dark:ring-gray-800"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-olive-500 dark:text-gray-400">
                          Personal recipe
                        </p>
                        <h3 className="mt-2 text-lg font-semibold text-olive-900 dark:text-gray-100">
                          {recipe.title || 'Untitled recipe'}
                        </h3>
                      </div>
                      <Bookmark className="h-5 w-5 text-olive-400 dark:text-gray-500" />
                    </div>

                    <p className="mt-3 text-sm text-olive-600 dark:text-gray-400 line-clamp-3">
                      {recipe.description || 'No description provided yet.'}
                    </p>

                    <div className="mt-4 flex items-center justify-between text-sm text-olive-500 dark:text-gray-400">
                      <span>{formatActivityDate(recipe.createdAt)}</span>
                      <Link
                        href={`/recipes/${encodeURIComponent(recipe.slug || recipe.id)}?source=community`}
                        className="inline-flex items-center gap-1 rounded-full bg-olive-100 px-3 py-1 font-medium text-olive-700 transition hover:bg-olive-200 dark:bg-olive-500/10 dark:text-olive-300 dark:hover:bg-olive-500/20"
                      >
                        View
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-8">
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-olive-100/60 dark:bg-gray-900 dark:ring-gray-800">
              <h3 className="text-lg font-semibold text-olive-900 dark:text-gray-100">Recent activity</h3>
              <p className="mt-1 text-sm text-olive-600 dark:text-gray-400">
                Automatic highlights based on your favorites and personal recipes.
              </p>
              <ul className="mt-5 space-y-4">
                {activities.map((item) => (
                  <li key={item.id} className="flex gap-3 rounded-xl bg-olive-50/60 p-3 dark:bg-gray-800/80">
                    <div className="mt-1 shrink-0 rounded-full bg-olive-200 p-2 text-olive-700 dark:bg-olive-500/20 dark:text-olive-200">
                      <Activity className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-olive-900 dark:text-gray-100">{item.title}</p>
                      <p className="text-sm text-olive-600 dark:text-gray-400">{item.description}</p>
                      <p className="mt-1 text-xs uppercase tracking-wide text-olive-500 dark:text-gray-500">
                        {item.time}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-olive-100/60 dark:bg-gray-900 dark:ring-gray-800">
              <h3 className="text-lg font-semibold text-olive-900 dark:text-gray-100">Profile management</h3>
              <p className="mt-1 text-sm text-olive-600 dark:text-gray-400">
                Coming soon — connect these shortcuts to your account settings.
              </p>
              <ul className="mt-5 space-y-3">
                {managementActions.map((action) => (
                  <li key={action.key}>
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-4 rounded-2xl bg-olive-50/60 p-4 text-left transition hover:bg-olive-100 dark:bg-gray-800/80 dark:hover:bg-gray-800"
                    >
                      <div className="flex items-start gap-3">
                        <div className="rounded-full bg-olive-200 p-2 text-olive-700 dark:bg-olive-500/20 dark:text-olive-200">
                          <action.icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium text-olive-900 dark:text-gray-100">{action.title}</p>
                          <p className="text-sm text-olive-600 dark:text-gray-400">{action.description}</p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-olive-400" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-olive-900 dark:text-gray-100">Community contributions</h2>
              <p className="mt-1 text-sm text-olive-600 dark:text-gray-400">
                Posts you&apos;ve shared with everyone. Data shown here is placeholder content until the
                community backend is connected.
              </p>
            </div>
            <Link
              href="/community"
              className="inline-flex items-center gap-1 rounded-full border border-olive-300 px-4 py-2 text-sm font-medium text-olive-700 transition hover:bg-olive-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              Visit community
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {communityPosts.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-olive-200 bg-white/60 p-8 text-center dark:border-gray-800 dark:bg-gray-900/60">
              <MessageSquare className="mx-auto h-10 w-10 text-olive-400" />
              <p className="mt-4 text-lg font-medium text-olive-900 dark:text-gray-100">No community posts yet</p>
              <p className="mt-2 text-sm text-olive-600 dark:text-gray-400">
                Share your culinary adventures with the community to see them highlighted here.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {communityPosts.map((post) => (
                <article
                  key={post.id}
                  className="flex h-full flex-col rounded-2xl bg-white p-6 shadow-sm ring-1 ring-olive-100/60 transition hover:-translate-y-1 hover:shadow-lg dark:bg-gray-900 dark:ring-gray-800"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-olive-500 dark:text-gray-400">Community post</p>
                      <h3 className="mt-2 text-lg font-semibold text-olive-900 dark:text-gray-100">{post.title}</h3>
                    </div>
                    <span className="rounded-full bg-olive-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-olive-700 dark:bg-olive-500/10 dark:text-olive-200">
                      {post.createdAt}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-olive-600 dark:text-gray-400 line-clamp-3">{post.excerpt}</p>
                  <div className="mt-4 flex items-center gap-4 text-sm text-olive-500 dark:text-gray-400">
                    <span className="inline-flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      {post.likes}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      {post.comments}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
