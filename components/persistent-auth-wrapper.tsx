// // "use client"

// // import type React from "react"

// // import { useAuth } from "@/hooks/use-auth"
// // import { LoadingSpinner } from "@/components/loading-spinner"
// // import { useEffect, useState } from "react"

// // interface PersistentAuthWrapperProps {
// //   children: React.ReactNode
// // }

// // export function PersistentAuthWrapper({ children }: PersistentAuthWrapperProps) {
// //   const { loading, checkAuth } = useAuth()
// //   const [initialLoad, setInitialLoad] = useState(true)

// //   useEffect(() => {
// //     const initAuth = async () => {
// //       await checkAuth()
// //       setInitialLoad(false)
// //     }

// //     if (initialLoad) {
// //       initAuth()
// //     }
// //   }, [checkAuth, initialLoad])

// //   // Show loading spinner only on initial page load
// //   if (initialLoad && loading) {
// //     return (
// //       <div className="min-h-screen flex items-center justify-center bg-ivory">
// //         <div className="text-center">
// //           <LoadingSpinner />
// //           <p className="mt-4 text-charcoal/60">Loading BBMI...</p>
// //         </div>
// //       </div>
// //     )
// //   }

// //   return <>{children}</>
// // }
// "use client"

// import { useAuth } from "@/hooks/use-auth"
// import { LoadingSpinner } from "@/components/loading-spinner"
// import { useEffect, useState } from "react"

// interface PersistentAuthWrapperProps {
//   children: React.ReactNode
// }

// export function PersistentAuthWrapper({ children }: PersistentAuthWrapperProps) {
//   const { loading, checkAuth, isAuthenticated } = useAuth()
//   const [initialLoad, setInitialLoad] = useState(true)
//   const [error, setError] = useState<string | null>(null)

//   useEffect(() => {
//     const initializeAuth = async () => {
//       try {
//         await checkAuth()
//       } catch (err) {
//         setError("Failed to verify authentication status")
//         console.error("Authentication check failed:", err)
//       } finally {
//         setInitialLoad(false)
//       }
//     }

//     if (initialLoad) {
//       initializeAuth()
//     }
//   }, [checkAuth, initialLoad])

//   if (error) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-ivory">
//         <div className="text-center">
//           <p className="mt-4 text-red-500">{error}</p>
//         </div>
//       </div>
//     )
//   }

//   if (initialLoad || loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-ivory">
//         <div className="text-center">
//           <LoadingSpinner />
//           <p className="mt-4 text-charcoal/60">Loading BBMI...</p>
//         </div>
//       </div>
//     )
//   }

//   return <>{children}</>
// }

"use client";

import { useAuth } from "@/hooks/use-auth";
import { LoadingSpinner } from "@/components/loading-spinner";

interface PersistentAuthWrapperProps {
  children: React.ReactNode;
}

export function PersistentAuthWrapper({
  children,
}: PersistentAuthWrapperProps) {
  const { loading } = useAuth();

  // While the auth state is loading, show loading spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ivory">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-charcoal/60">Loading BBMI...</p>
        </div>
      </div>
    );
  }

  // Once loading is done, render children normally
  return <>{children}</>;
}
