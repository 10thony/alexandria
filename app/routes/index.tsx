import { createFileRoute } from '@tanstack/react-router'
import { useUser, SignInButton, SignUpButton, UserButton } from '@clerk/clerk-react'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  const { isSignedIn, user } = useUser()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
          Welcome to Alexandria
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          An AI Mobile App Builder
        </p>
      </div>

      <div className="mt-12 text-center">
        {isSignedIn ? (
          <div className="space-y-4">
            <p className="text-lg text-gray-700">
              Welcome, {user?.firstName || user?.emailAddresses[0]?.emailAddress}!
            </p>
            <UserButton afterSignOutUrl="/" />
          </div>
        ) : (
          <div className="space-x-4">
            <SignInButton mode="modal">
              <button className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Sign Up
              </button>
            </SignUpButton>
          </div>
        )}
      </div>
    </div>
  )
}

