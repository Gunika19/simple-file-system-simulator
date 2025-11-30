
import { Card, CardAction, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "./ui/badge"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Label } from "./ui/label"
import { Input } from "./ui/input"
import { FileData } from "@/lib/types"

// const data = {
//   id: "655a1b2c3d4e5f6789012345", // Dummy MongoDB ObjectId (24 hex characters)
//   fileName: "NotebookLM Mind Map.png",
//   fileType: "image",
//   s3Key: "uploads/ca16f7c3-4a74-4e7a-9637-2b476fb0508f-NotebookLM Mind Map.png",
//   fileUrl: "https://your-s3-bucket.com/uploads/notebooklm-mind-map.png", // Dummy URL
//   status: "uploaded", // Status implied by "Time Remaining"
//   accessCode: 187052,
//   targetUserEmails: [
//     "bob@email.com", "alice@email.com"
//   ],
//   expiryDurationMinutes: 5,
//   // Calculated: 5 minutes before the expiry time shown in the image
//   firstAccessedAt: "2025-11-17T15:43:19.000Z", 
//   // Taken directly from the image (3:48:19 PM)
//   expiresAt: "2025-11-17T15:48:19.000Z", 
//   // Dummy creation time (slightly before access)
//   createdAt: "2025-11-17T15:40:00.000Z" 
// }

export function FileCard({ data }: { data: FileData }) {
  function capitalize(str: string) {
    return str.length === 0 ? "" : str.charAt(0).toUpperCase() + str.slice(1)
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
              Use the link below to download the file.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="link" className="sr-only">
                Link
              </Label>
              <Input
                id="link"
                defaultValue={data.fileUrl}
                readOnly
              />
            </div>
          </div>
          <DialogFooter className="sm:justify-start">
            <DialogClose asChild>
              <Button type="button" variant="secondary">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}