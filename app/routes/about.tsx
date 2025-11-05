import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
  component: About,
})

function About() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900">About Alexandria</h1>
      <p className="mt-4 text-lg text-gray-600">
        Alexandria is an AI-powered mobile app builder built with modern web technologies.
      </p>
    </div>
  )
}

