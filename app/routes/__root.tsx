import { createRootRoute, Outlet, Link } from '@tanstack/react-router'
import { ClerkProvider } from '@clerk/clerk-react'
import { ConvexProvider, ConvexReactClient } from 'convex/react'

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string)
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string

export const Route = createRootRoute({
  component: () => (
    <ClerkProvider publishableKey={clerkPubKey}>
      <ConvexProvider client={convex}>
        <div className="min-h-screen">
          <nav className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex">
                  <Link
                    to="/"
                    className="inline-flex items-center px-2 pt-1 text-sm font-medium text-gray-900"
                  >
                    Alexandria
                  </Link>
                  <Link
                    to="/about"
                    className="inline-flex items-center px-2 pt-1 ml-4 text-sm font-medium text-gray-500 hover:text-gray-900"
                  >
                    About
                  </Link>
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center px-2 pt-1 ml-4 text-sm font-medium text-gray-500 hover:text-gray-900"
                  >
                    Dashboard
                  </Link>
                </div>
              </div>
            </div>
          </nav>
          <main>
            <Outlet />
          </main>
        </div>
      </ConvexProvider>
    </ClerkProvider>
  ),
})

