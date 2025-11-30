"use client"

import { Plus, X } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import React, { useState } from "react";
import { Spinner } from "./ui/spinner";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import { confirmUpload, getPreSignedUrl } from "@/lib/api";
import { toast } from "sonner";

export function FileUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [expiry, setExpiry] = useState<string | number>("")
  const [inputValue, setInputValue] = useState<string>("")
  const [emails, setEmails] = useState<string[]>([])
  const [error, setError] = useState<string>("")

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] ?? null)
  }

  const validateExpiry = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value

    // Allow user to completely clear the input
    if (val === "") {
      setExpiry("")
      return
    }

    const intVal = parseInt(val, 10)
    if (intVal > 0) setExpiry(intVal)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      const email = inputValue.trim()
      if (!email) return

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError("Please enter a valid email.")
        return
      }

      if (emails.includes(email)) {
        setError("This email is already added.")
        return
      }

      setEmails([...emails, email])
      setInputValue("")
      setError("")
    }
  }

  const removeEmail = (emailToRemove: string) => {
    setEmails(emails.filter((email) => email !== emailToRemove))
  }

  const uploadToS3Presigned = async (url: string, file: File) => {
    const res = await fetch(url, {
      method: "PUT", headers: {
        "Content-Type": file.type || "application/octet-stream",
      },
      body: file,
    })

    if (!res.ok) throw new Error("Upload failed: " + res.statusText)
    return true
  }

  const handleSubmit = async () => {
    if (!file) return alert("Choose a file first")
    setLoading(true)

    try {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("Not authenticated")

      const pres = await getPreSignedUrl(token, {
        fileName: file.name,
        fileType: file.type,
        folder: "uploads",
        targetUserEmails: emails,
        expiryDurationMinutes: expiry
      })

      const { uploadUrl, key, accessCode } = pres.data

      await uploadToS3Presigned(uploadUrl, file)

      await confirmUpload(token, key)
      // alert("File shared successfully")

      // toast("File shared successfully", {
      //   description: `Access Code is (ONLY SHOWN ONCE): ${accessCode}`,
      //   action: {
      //     label: "Copy",
      //     onClick: () => navigator.clipboard.writeText(accessCode)
      //   }
      // })

      toast("File shared successfully", {
        description: `Access Code is (ONLY SHOWN ONCE): ${accessCode}`,
        action: {
          label: "Copy",
          onClick: async () => {
            try {
              await navigator.clipboard.writeText(String(accessCode));
              toast("Copied!", { description: "Access code copied to clipboard." });
            } catch {
              toast("Failed to copy");
            }
          }
        }
      })

      setFile(null)
    } catch (err: any) {
      console.error(err)
      // alert(err?.message ?? "Upload failed")

      toast(err?.message ?? "Upload failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="m-2 mt-10"><Plus /> Add</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload a file</DialogTitle>
            <DialogDescription>Provide the file, add target user emails & set expiry. Share securely.</DialogDescription>
          </DialogHeader>
          <Label>Provide File</Label>
          <Input type="file" onChange={onFile} />
          <Label>Set Expiry (in Minutes)</Label>
          <Input
            type="number"
            step="1"
            inputMode="numeric"
            name="expiry"
            value={expiry}
            onChange={validateExpiry}
            placeholder="Positive integers only"
          />
          <Separator />
          <div className="flex flex-wrap gap-2">
            {
              emails.map(
                (email: string) => (
                  <Badge key={email} variant="secondary">
                    {email}
                    <button
                      onClick={() => removeEmail(email)}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )
              )
            }
          </div>
          <Label>Share with Users</Label>
          <Input
            type="email"
            placeholder="Enter one user email at a time and press Enter"
            value={inputValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setInputValue(e.target.value)
              setError("")
            }}
            onKeyDown={handleKeyDown}
          />
          {error && <span className="text-xs text-red-500">{error}</span>}
          <div className="flex items-center justify-center">
            {loading ? (
              <span className="flex items-center gap-2">
                <Spinner /> Uploading
              </span>
            ) : (
              <Button variant="outline" onClick={handleSubmit} disabled={(!file && emails.length > 0) || loading}>Upload</Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}