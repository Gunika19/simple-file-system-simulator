"use client"

import { useState } from "react"
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "./ui/badge"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { getFileDownloadLink } from "@/lib/api"
import { FileData } from "@/lib/types"
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "./ui/input-otp"
import { toast } from "sonner"

export function IncomingFileCard({ data }: { data: FileData }) {
  const [otp, setOtp] = useState("")

  function capitalize(str: string) {
    return str.length === 0 ? "" : str.charAt(0).toUpperCase() + str.slice(1)
  }

  async function handleSubmit() {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Token expired. Please login again.")
      return
    }

    const res = await getFileDownloadLink(token, data.s3Key, otp);
    if (!res.success) {
      alert("Failed to load file.")
      return
    }

    try {
      await navigator.clipboard.writeText(String(res.data.downloadUrl));
    } catch {}

    toast("Download link ready!", {
      description: `Your download link is: ${res.data.downloadUrl}`,
      action: {
        label: "Copy",
        onClick: async () => {
          try {
            await navigator.clipboard.writeText(String(res.data.downloadUrl));
            toast("Copied!", { description: "Download link copied to clipboard." });
          } catch {
            toast("Failed to copy");
          }
        }
      }
    })
  }

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Card className="w-3/4 mx-auto">
            <CardHeader>
              <CardTitle>
                <div className="flex items-center gap-2">
                  {data.fileName}
                  <Separator
                    orientation="vertical"
                    className="mr-2 data-[orientation=vertical]:h-4"
                  />
                  <Badge variant="secondary">{ capitalize(data.status) }</Badge>
                  <Badge variant="secondary">{ capitalize(data.fileType) }</Badge>
                </div>
              </CardTitle>
              <CardDescription>{data.s3Key}</CardDescription>
            </CardHeader>
          </Card>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Download Link</DialogTitle>
            <DialogDescription>
              Enter the Auth Code (on your mail) for this file.
            </DialogDescription>
          </DialogHeader>
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={setOtp}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0}></InputOTPSlot>
              <InputOTPSlot index={1}></InputOTPSlot>
              <InputOTPSlot index={2}></InputOTPSlot>
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={3}></InputOTPSlot>
              <InputOTPSlot index={4}></InputOTPSlot>
              <InputOTPSlot index={5}></InputOTPSlot>
            </InputOTPGroup>
          </InputOTP>
          <DialogFooter className="sm:justify-start">
            <Button
              type="button"
              variant="secondary"
              disabled={otp.length !== 6}
              onClick={handleSubmit}
            >Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}