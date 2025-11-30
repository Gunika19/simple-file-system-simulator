import { SidebarLeft } from "@/components/sidebar-left"
import { SidebarRight } from "@/components/sidebar-right"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import AuthGuardClient from "@/components/authguard-client"
import { FileCard } from "@/components/file-card"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import IncomingFilesList from "@/components/incoming-files"
import UploadedFilesList from "@/components/uploaded-files"

export default function Page() {
  return (
    <AuthGuardClient verify={false}>
      <SidebarProvider>
        <SidebarLeft />
        <SidebarInset>
          <header className="bg-background sticky top-0 flex h-14 shrink-0 items-center gap-2">
            <div className="flex flex-1 items-center gap-2 px-3">
              <SidebarTrigger />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbPage className="line-clamp-1">
                      SecureShare - Secure File Sharing
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4">
            <Card className="bg-transparent shadow-none border border-border">
              <CardHeader>
                <CardTitle>Your Uploads</CardTitle>
                <CardDescription>You can see your previously uploaded files here.</CardDescription>
              </CardHeader>
              <Separator />
              {/* <IncomingFilesList /> */}
              <UploadedFilesList />
            </Card>
          </div>
          <div className="flex flex-1 flex-col gap-4 p-4">
            <Card className="bg-transparent shadow-none border border-border">
              <CardHeader>
                <CardTitle>Shared with You</CardTitle>
                <CardDescription>These are the files other users have shared with you.</CardDescription>
              </CardHeader>
              <Separator />
              <IncomingFilesList />
            </Card>
          </div>
        </SidebarInset>
        <SidebarRight />
      </SidebarProvider>
    </AuthGuardClient>
  )
}
