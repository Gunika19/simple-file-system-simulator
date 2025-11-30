export type FileData = {
  id: string
  fileName: string
  fileType: string
  s3Key: string
  fileUrl: string
  status: string
  accessCode: number | null
  targetUserEmails: string[]
  expiryDurationMinutes: number
  firstAccessedAt: string
  expiresAt: string
  createdAt: string
}

export type PreSignedUrlResponse = {
  success: boolean
  data: {
    uploadUrl: string
    key: string
    fileUrl: string
    accessCode: string
    expiryDurationMinutes: number
    targetUserEmails: string[]
  }
  message: string
}

export type PreSignedUrlPayload = {
  fileName: string
  fileType: string
  folder: string
  targetUserEmails: string[]
  expiryDurationMinutes: string | number
}
