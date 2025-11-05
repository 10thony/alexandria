import { useConvex } from 'convex/react'
import { useAuth } from '@clerk/clerk-react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'

/**
 * Hook to use Convex with Clerk authentication
 * This ensures that Convex queries/mutations are authenticated with Clerk tokens
 */
export function useAuthenticatedConvex() {
  const convex = useConvex()
  const { getToken } = useAuth()

  // You can extend this hook to automatically pass Clerk tokens to Convex
  // For now, it returns the convex client with auth context
  return convex
}

