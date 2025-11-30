"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getProfile } from "@/lib/api"
import { Spinner } from "@/components/ui/spinner"

export default function AuthGuardClient({
  children,
  verify = false,
}: {
  children: React.ReactNode
  verify?: boolean
}) {
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const run = async () => {
      try {
        const token = typeof window !== "undefined"? localStorage.getItem("token") : null
        if (!token) {
          router.replace("/login")
          return
        }

        if (verify) {
          try {
            await getProfile(token)
            setChecking(false)
          } catch {
            // Inavlid token
            localStorage.removeItem("token")
            localStorage.removeItem("user")
            router.replace("/login")
            return
          }
        } else {
          setChecking(false)
        }
      } catch (err) {
        console.error("auth guard error", err)
        router.replace("/login")
      }
    }

    run()
  }, [router, verify])

  if (checking) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Spinner className="size-8" />
      </div>
    )
  }

  return <>{ children }</>
}