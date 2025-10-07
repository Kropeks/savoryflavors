'use client'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <section className="relative overflow-hidden py-24 sm:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/60 via-white to-white dark:from-olive-950/60 dark:via-gray-950 dark:to-gray-950" aria-hidden="true" />
        <div className="absolute top-10 right-10 h-64 w-64 rounded-full bg-emerald-300/40 dark:bg-olive-500/20 blur-3xl" aria-hidden="true" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-flex items-center rounded-full bg-emerald-100 dark:bg-olive-800/40 px-4 py-1 text-sm font-medium text-emerald-700 dark:text-olive-200">Our Story</span>
              <h1 className="mt-6 text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
                Savor every moment, nourish every journey
              </h1>
              <p className="mt-6 text-lg text-gray-700 dark:text-gray-200 max-w-xl">
                Welcome to Savory, your all-in-one platform for food enthusiasts, home cooks, and health-conscious individuals. We bring together the joy of cooking, the power of community, and the science of nutrition — all in one place.
              </p>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] rounded-3xl bg-gradient-to-tr from-emerald-400 via-emerald-300 to-emerald-200 dark:from-olive-600 dark:via-olive-500 dark:to-green-500 opacity-70" />
              <div className="absolute inset-6 rounded-3xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/60 dark:border-olive-800/40 p-8 flex flex-col justify-center">
                <p className="text-xl font-semibold text-gray-900 dark:text-white">Create. Share. Flourish.</p>
                <p className="mt-4 text-sm text-gray-700 dark:text-gray-300">
                  Organize recipes, swap stories, and reach your wellness goals with a platform built for real life in the kitchen.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24 bg-white dark:bg-gray-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6 text-lg leading-relaxed text-gray-700 dark:text-gray-200">
            <p>
              At Savory, users can create, manage, and share their favorite recipes through an easy-to-use recipe management system. Whether you&rsquo;re a beginner or a seasoned cook, our platform helps you organize your dishes, explore new flavors, and discover meals shared by others in our blog-like community. Here, members can post their culinary creations, exchange cooking tips, and inspire others through food stories and experiences.
            </p>
            <p>
              But Savory goes beyond just sharing recipes — it&rsquo;s also your personal diet tracker and meal planner. You can log daily meals, track calorie and nutrient intake, and plan balanced menus that fit your lifestyle and health goals. With customizable meal plans and progress tracking, you can easily stay on top of your wellness journey while enjoying what you love most — delicious, nourishing food.
            </p>
            <p>
              At Savory, we believe food connects people and empowers better living. Whether you&rsquo;re here to share your passion, learn from others, or stay on track with your health goals, Savory is your companion in creating a flavorful and balanced life.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-emerald-50 via-white to-emerald-100 dark:from-olive-900/40 dark:via-gray-950 dark:to-olive-800/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="rounded-3xl bg-white/90 dark:bg-gray-900/80 border border-emerald-200/70 dark:border-olive-700/40 p-8 shadow-lg">
              <h3 className="text-xl font-semibold text-emerald-700 dark:text-olive-200">Recipe Studio</h3>
              <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">
                Build a living library of your culinary creations with tags, notes, and step-by-step instructions designed for cooks at any level.
              </p>
            </div>
            <div className="rounded-3xl bg-white/90 dark:bg-gray-900/80 border border-emerald-200/70 dark:border-olive-700/40 p-8 shadow-lg">
              <h3 className="text-xl font-semibold text-emerald-700 dark:text-olive-200">Wellness Companion</h3>
              <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">
                Track nutrients, log meals, and follow personalized plans that make healthy eating feel natural, not stressful.
              </p>
            </div>
            <div className="rounded-3xl bg-white/90 dark:bg-gray-900/80 border border-emerald-200/70 dark:border-olive-700/40 p-8 shadow-lg">
              <h3 className="text-xl font-semibold text-emerald-700 dark:text-olive-200">Community Table</h3>
              <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">
                Share experiences, discover new flavors, and connect with food lovers who celebrate creativity and kindness.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24 bg-white dark:bg-gray-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-r from-emerald-500 to-emerald-400 dark:from-olive-500 dark:to-green-500 px-8 py-12 sm:px-12 sm:py-16 text-white shadow-2xl overflow-hidden">
            <div className="grid md:grid-cols-[2fr,1fr] gap-10 items-center">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold">Join the Savory movement</h2>
                <p className="mt-4 text-base sm:text-lg text-emerald-50/90">
                  Discover recipes, build healthy habits, and share the moments that make life flavorful. Savory grows with you—one meal, one connection, one story at a time.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <a
                  href="/community"
                  className="inline-flex items-center justify-center rounded-full bg-white/15 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/25"
                >
                  Explore the community
                </a>
                <a
                  href="/recipes"
                  className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
                >
                  Browse recipes
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
