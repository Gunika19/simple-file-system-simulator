import { PreSignedUrlPayload, PreSignedUrlResponse } from "./types"

export type SignupPayload = {
  name: string
  email: string
  password: string
}

export type ApiError = {
  message: string
  status?: number
  [k: string]: any
}

const getBaseUrl = () => {
  if (typeof window === "undefined") {
    return process.env.API_URL ?? "http://localhost:4000"
  }

  return process.env.NEXT_PUBLIC_API_URL ?? ""
}

async function fetchWithTimeout(input: RequestInfo, init: RequestInit = {}, timeout = 10000) {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)

  try {
    const res = await fetch(input, { ...init, signal: controller.signal })
    return res
  } finally {
    clearTimeout(id)
  }
}

async function handleResponse(res: Response) {
  const text = await res.text().catch(() => "")
  let body: any = text

  try {
    body = text ? JSON.parse(text) : {}
  } catch (_) {}

  if (!res.ok) {
    const err: ApiError = {
      message: body?.message ?? res.statusText ?? "Request failed",
      status: res.status,
      ...body,
    }
    throw err
  }

  return body
}

async function request<T = any>(path: string, opts: RequestInit = {}) {
  const base = getBaseUrl()
  const url = base ? new URL(path, base).toString() : path
  const res = await fetchWithTimeout(url, opts)
  return handleResponse(res) as Promise<T>
}

export async function signup(payload: SignupPayload) {
  return request("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
}


export async function login(payload: { email: string, password: string }) {
  return request("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
}

export async function getProfile(token: string) {
  return request("/api/users/profile", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function getIncomingFiles(token: string) {
  return request("/api/upload/shared-with-me", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function getUserUploadedFiles(token: string) {
  return request("/api/upload/my-files", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function getFileDownloadLink(token: string, s3key: string, accessCode: string) {
  return request("/api/upload/download", {
    method: "POST",
    headers: { 
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      s3Key: s3key, accessCode: accessCode
    }),
  })
}

export async function getPreSignedUrl(token: string, payload: PreSignedUrlPayload) {
  return request<PreSignedUrlResponse>("/api/upload/presigned-url", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload),
  })
}

export async function confirmUpload(token: string, key: string) {
  return request("/api/upload/confirm", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ key }),
  })
}

export function logout() {
  localStorage.removeItem("token")
  localStorage.removeItem("user")
}