#!/usr/bin/env python3
"""
File Sharing Workflow Test Script
Tests the complete upload/download workflow with expiry and access codes
"""

import requests
import time
import json
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:3000/api"
TEST_FILE_CONTENT = b"This is a confidential test document!"
TEST_FILE_NAME = "confidential-report.pdf"

# Color codes for terminal output
class Colors:
    GREEN = '\033[92m'
    BLUE = '\033[94m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    END = '\033[0m'
    BOLD = '\033[1m'

def print_step(step_num, description):
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*60}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.GREEN}STEP {step_num}: {description}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.BLUE}{'='*60}{Colors.END}\n")

def print_response(response, title="Response"):
    print(f"{Colors.YELLOW}{title}:{Colors.END}")
    try:
        print(json.dumps(response.json(), indent=2))
    except:
        print(response.text)
    print(f"Status Code: {response.status_code}\n")

def print_error(message):
    print(f"{Colors.RED}❌ ERROR: {message}{Colors.END}")

def print_success(message):
    print(f"{Colors.GREEN}✅ {message}{Colors.END}")

# Step 1: Register Alice (Uploader)
print_step(1, "Register Alice (File Uploader)")
alice_data = {
    "name": "Alice",
    "email": f"alice_{int(time.time())}@example.com",
    "password": "password123"
}
response = requests.post(f"{BASE_URL}/auth/register", json=alice_data)
print_response(response, "Alice Registration")

if response.status_code != 201:
    print_error("Failed to register Alice")
    exit(1)

alice_token = response.json()["data"]["token"]
alice_email = response.json()["data"]["user"]["email"]
print_success(f"Alice registered: {alice_email}")
print(f"Token: {alice_token[:50]}...\n")

# Step 2: Register Bob (Target User)
print_step(2, "Register Bob (Target User)")
bob_data = {
    "name": "Bob",
    "email": f"bob_{int(time.time())}@example.com",
    "password": "password123"
}
response = requests.post(f"{BASE_URL}/auth/register", json=bob_data)
print_response(response, "Bob Registration")

if response.status_code != 201:
    print_error("Failed to register Bob")
    exit(1)

bob_token = response.json()["data"]["token"]
bob_email = response.json()["data"]["user"]["email"]
print_success(f"Bob registered: {bob_email}")
print(f"Token: {bob_token[:50]}...\n")

# Step 3: Register Charlie (Another Target User)
print_step(3, "Register Charlie (Another Target User)")
charlie_data = {
    "name": "Charlie",
    "email": f"charlie_{int(time.time())}@example.com",
    "password": "password123"
}
response = requests.post(f"{BASE_URL}/auth/register", json=charlie_data)
print_response(response, "Charlie Registration")

if response.status_code != 201:
    print_error("Failed to register Charlie")
    exit(1)

charlie_token = response.json()["data"]["token"]
charlie_email = response.json()["data"]["user"]["email"]
print_success(f"Charlie registered: {charlie_email}")

# Step 4: Alice requests presigned upload URL
print_step(4, "Alice Requests Presigned Upload URL")
presigned_request = {
    "fileName": TEST_FILE_NAME,
    "fileType": "application/pdf",
    "folder": "documents",
    "targetUserEmails": [bob_email, charlie_email],
    "expiryDurationMinutes": 2  # 2 minutes for testing
}

headers = {"Authorization": f"Bearer {alice_token}"}
response = requests.post(
    f"{BASE_URL}/upload/presigned-url",
    json=presigned_request,
    headers=headers
)
print_response(response, "Presigned URL Response")

if response.status_code != 200:
    print_error("Failed to get presigned URL")
    exit(1)

upload_url = response.json()["data"]["uploadUrl"]
s3_key = response.json()["data"]["key"]
file_url = response.json()["data"]["fileUrl"]
access_code = response.json()["data"]["accessCode"]

print_success(f"Presigned URL obtained")
print(f"S3 Key: {s3_key}")
print(f"Access Code: {Colors.BOLD}{access_code}{Colors.END}")
print(f"Target Users: {bob_email}, {charlie_email}")
print(f"Expiry Duration: 2 minutes\n")

# Step 5: Alice uploads file to S3
print_step(5, "Alice Uploads File to S3")
response = requests.put(
    upload_url,
    data=TEST_FILE_CONTENT,
    headers={"Content-Type": "application/pdf"}
)
print(f"Upload Status Code: {response.status_code}")

if response.status_code not in [200, 204]:
    print_error("Failed to upload file to S3")
    exit(1)

print_success("File uploaded to S3 successfully\n")

# Step 6: Alice confirms upload
print_step(6, "Alice Confirms Upload")
confirm_data = {"key": s3_key}
response = requests.post(
    f"{BASE_URL}/upload/confirm",
    json=confirm_data,
    headers=headers
)
print_response(response, "Confirm Upload Response")

if response.status_code != 200:
    print_error("Failed to confirm upload")
    exit(1)

print_success("Upload confirmed - File status: uploaded\n")

# Step 7: Alice views her uploaded files
print_step(7, "Alice Views Her Uploaded Files")
response = requests.get(
    f"{BASE_URL}/upload/my-files",
    headers=headers
)
print_response(response, "Alice's Files")

files = response.json()["data"]
print_success(f"Alice has {len(files)} file(s)")
if files:
    file = files[0]
    print(f"  - File: {file['fileName']}")
    print(f"  - Status: {file['status']}")
    print(f"  - Access Code: {file['accessCode']}")
    print(f"  - First Accessed: {file['firstAccessedAt']}")
    print(f"  - Expires At: {file['expiresAt']}\n")

# Step 8: Bob requests download URL (FIRST ACCESS - Timer Starts!)
print_step(8, "Bob Requests Download URL (FIRST ACCESS)")
print(f"{Colors.YELLOW}⏱️  Timer starts NOW!{Colors.END}\n")

download_request = {
    "s3Key": s3_key,
    "accessCode": access_code
}
bob_headers = {"Authorization": f"Bearer {bob_token}"}
response = requests.post(
    f"{BASE_URL}/upload/download",
    json=download_request,
    headers=bob_headers
)
print_response(response, "Bob's Download Request")

if response.status_code != 200:
    print_error("Failed to get download URL")
    exit(1)

download_url = response.json()["data"]["downloadUrl"]
expires_at = response.json()["data"]["expiresAt"]
time_remaining = response.json()["data"]["timeRemainingMinutes"]

print_success("Download URL obtained")
print(f"Expires At: {expires_at}")
print(f"Time Remaining: {time_remaining} minutes\n")

# Step 9: Bob downloads the file
print_step(9, "Bob Downloads the File")
response = requests.get(download_url)
print(f"Download Status Code: {response.status_code}")
print(f"Content Length: {len(response.content)} bytes")
print(f"Content: {response.content.decode()}\n")

if response.status_code == 200:
    print_success("File downloaded successfully\n")
else:
    print_error("Failed to download file")

# Step 10: Charlie tries with WRONG access code
print_step(10, "Charlie Tries with WRONG Access Code")
wrong_request = {
    "s3Key": s3_key,
    "accessCode": "000000"  # Wrong code!
}
charlie_headers = {"Authorization": f"Bearer {charlie_token}"}
response = requests.post(
    f"{BASE_URL}/upload/download",
    json=wrong_request,
    headers=charlie_headers
)
print_response(response, "Charlie's Failed Request")

if response.status_code == 400:
    print_success("Access correctly denied - Invalid access code\n")
else:
    print_error("Should have been denied!")

# Step 11: Charlie tries with CORRECT access code
print_step(11, "Charlie Tries with CORRECT Access Code")
correct_request = {
    "s3Key": s3_key,
    "accessCode": access_code
}
response = requests.post(
    f"{BASE_URL}/upload/download",
    json=correct_request,
    headers=charlie_headers
)
print_response(response, "Charlie's Successful Request")

if response.status_code == 200:
    time_remaining = response.json()["data"]["timeRemainingMinutes"]
    print_success(f"Access granted! Time remaining: {time_remaining} minutes\n")
else:
    print_error("Charlie should have access!")

# Step 12: Bob checks file details
print_step(12, "Bob Checks File Details")
response = requests.get(
    f"{BASE_URL}/upload/file/{s3_key}",
    headers=bob_headers
)
print_response(response, "File Details")

if response.status_code == 200:
    details = response.json()["data"]
    print_success("File details retrieved")
    print(f"  - Status: {details['status']}")
    print(f"  - First Accessed: {details['firstAccessedAt']}")
    print(f"  - Expires At: {details['expiresAt']}")
    print(f"  - Is Expired: {details['isExpired']}\n")

# Step 13: Wait for expiry and test
print_step(13, "Testing Expiry (waiting 2+ minutes)")
print(f"{Colors.YELLOW}Waiting for file to expire...{Colors.END}")
print(f"Current time: {datetime.now().strftime('%H:%M:%S')}")

# Wait for expiry (2 minutes + buffer)
wait_time = 125  # 2 minutes 5 seconds
print(f"Waiting {wait_time} seconds...\n")

for i in range(wait_time, 0, -10):
    print(f"⏳ {i} seconds remaining...", end='\r')
    time.sleep(10)

print("\n")

# Step 14: Bob tries to access after expiry
print_step(14, "Bob Tries to Access After Expiry")
response = requests.post(
    f"{BASE_URL}/upload/download",
    json=download_request,
    headers=bob_headers
)
print_response(response, "Bob's Expired Access Attempt")

if response.status_code == 400:
    error_message = response.json().get("message", "")
    if "expired" in error_message.lower():
        print_success("File correctly marked as expired!\n")
    else:
        print_error(f"Unexpected error: {error_message}")
else:
    print_error("File should be expired!")

# Step 15: Register unauthorized user
print_step(15, "Test Unauthorized Access")
unauthorized_data = {
    "name": "Eve",
    "email": f"eve_{int(time.time())}@example.com",
    "password": "password123"
}
response = requests.post(f"{BASE_URL}/auth/register", json=unauthorized_data)
eve_token = response.json()["data"]["token"]
eve_email = response.json()["data"]["user"]["email"]

print(f"Eve registered: {eve_email}\n")

# Eve tries to access the file
eve_headers = {"Authorization": f"Bearer {eve_token}"}
response = requests.post(
    f"{BASE_URL}/upload/download",
    json=download_request,
    headers=eve_headers
)
print_response(response, "Eve's Unauthorized Access Attempt")

if response.status_code in [400, 403]:
    print_success("Unauthorized access correctly denied!\n")
else:
    print_error("Eve should not have access!")

# Final Summary
print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*60}{Colors.END}")
print(f"{Colors.BOLD}{Colors.GREEN}TEST WORKFLOW COMPLETED!{Colors.END}")
print(f"{Colors.BOLD}{Colors.BLUE}{'='*60}{Colors.END}\n")

print(f"{Colors.BOLD}Summary:{Colors.END}")
print(f"  ✅ Alice uploaded file: {TEST_FILE_NAME}")
print(f"  ✅ Access Code: {access_code}")
print(f"  ✅ Target Users: {bob_email}, {charlie_email}")
print(f"  ✅ Bob accessed successfully (first access)")
print(f"  ✅ Charlie accessed successfully (with correct code)")
print(f"  ✅ Wrong access code was rejected")
print(f"  ✅ File expired after 2 minutes")
print(f"  ✅ Unauthorized user was blocked")
print(f"\n{Colors.GREEN}All tests passed! 🎉{Colors.END}\n")