import { createFileRoute } from '@tanstack/react-router'
import { useUser } from '@clerk/clerk-react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'

export const Route = createFileRoute('/dashboard')({
  component: Dashboard,
})

function Dashboard() {
  const { user, isLoaded } = useUser()
  const exampleData = useQuery(api.example.getExample)
  const createExample = useMutation(api.example.createExample)

  if (!isLoaded) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div>Loading...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p>Please sign in to access the dashboard.</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      <div className="mt-6">
        <p className="text-lg text-gray-700">
          Welcome, {user.firstName || user.emailAddresses[0]?.emailAddress}!
        </p>
        <p className="mt-2 text-gray-600">
          This is your authenticated dashboard. You can add Convex queries and mutations here.
        </p>
        
        {exampleData && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              Convex Query Result: {exampleData.message}
            </p>
          </div>
        )}
        
        <button
          onClick={() => createExample({ text: 'Hello from dashboard!' })}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Test Convex Mutation
        </button>
      </div>
    </div>
  )
}

