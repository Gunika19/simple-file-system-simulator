"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getUserUploadedFiles } from "@/lib/api"
import { FileCard } from "./file-card"
import { Spinner } from "./ui/spinner"
import { FileData } from "@/lib/types"

export default function UploadedFilesList() {
  const router = useRouter()
  const [files, setFiles] = useState<FileData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

    if (!token) {
      router.replace("/login")
      return
    }

    async function load() {
      setLoading(true)
      setError(null)

      try {
        if (!token) return // Just to please intellisense
        const res = await getUserUploadedFiles(token)

        if (!mounted) return
        if (res?.success) {
          setFiles(res.data ?? [])
        } else {
          setError(res?.message ?? "Failed to load files")
        }
      } catch (err: any) {
        if (!mounted) return
        setError(err?.message ?? "An unexpected error occurred")
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()

    return () => {
      mounted = false
    }
  }, [router])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Spinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-sm text-destructive py-4">
        {error}
      </div>
    )
  }

  return (
    <div
      className="flex flex-col items-center gap-4 overflow-y-auto pr-2"
      style={{ maxHeight: "450px" }}
    >
      {files.length === 0 ? (
        <div className="text-sm text-muted-foreground py-4">No files shared yet. Begin by sharing one.</div>
      ) : (
        files.map((f) => (
          <FileCard key={f.id} data={f} />
        ))
      )}
    </div>
  )
}