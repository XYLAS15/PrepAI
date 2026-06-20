import requests
import time
import sys
import os

BASE_URL = "http://localhost:8080/api"

def run_test():
    print("=== STARTING E2E AI FLOW VERIFICATION ===")
    
    # 1. Register a test user (or login if exists)
    email = f"test_{int(time.time())}@example.com"
    password = "password123"
    fullname = "Test User"
    
    print(f"Registering user: {email}...")
    reg_res = requests.post(f"{BASE_URL}/auth/register", json={
        "fullName": fullname,
        "email": email,
        "password": password
    })
    
    if reg_res.status_code not in [200, 201]:
        print(f"Registration failed with code {reg_res.status_code}: {reg_res.text}")
        sys.exit(1)
        
    print("Registration successful!")
    
    # 2. Login to get token
    print("Logging in...")
    login_res = requests.post(f"{BASE_URL}/auth/login", json={
        "email": email,
        "password": password
    })
    
    if login_res.status_code != 200:
        print(f"Login failed: {login_res.text}")
        sys.exit(1)
        
    auth_data = login_res.json()
    token = auth_data["accessToken"]
    headers = {"Authorization": f"Bearer {token}"}
    print("Login successful! Token acquired.")
    
    # 3. Upload Resume
    resume_path = "C:/Users/Ankit/.gemini/antigravity-ide/scratch/interview-prep-platform/mock_resume.txt"
    print(f"Uploading resume from {resume_path}...")
    
    with open(resume_path, "rb") as f:
        files = {"file": ("mock_resume.txt", f, "text/plain")}
        upload_res = requests.post(f"{BASE_URL}/resumes/upload", headers=headers, files=files)
        
    if upload_res.status_code not in [200, 201]:
        print(f"Upload failed: {upload_res.text}")
        sys.exit(1)
        
    resume_data = upload_res.json()
    resume_id = resume_data["id"]
    print(f"Resume uploaded successfully! ID: {resume_id}. Status: {resume_data['status']}")
    
    # 4. Poll resume status for Groq processing completion
    print("Waiting for Groq AI to process the resume (polling)...")
    status = "PROCESSING"
    attempts = 0
    parsed_data = None
    
    while status == "PROCESSING" and attempts < 15:
        time.sleep(3)
        attempts += 1
        check_res = requests.get(f"{BASE_URL}/resumes/{resume_id}", headers=headers)
        if check_res.status_code == 200:
            res_json = check_res.json()
            status = res_json["status"]
            parsed_data = res_json.get("parsedData")
            print(f"  [Attempt {attempts}] Status: {status}")
        else:
            print(f"  Failed to poll status: {check_res.text}")
            break
            
    if status != "COMPLETED":
        print(f"Resume parsing did not complete. Final status: {status}")
        sys.exit(1)
        
    print("Groq AI Resume Parsing Completed Successfully!")
    print(f"Parsed Resume Data: {parsed_data}")
    
    # 5. Create Job Description
    jd_path = "C:/Users/Ankit/.gemini/antigravity-ide/scratch/interview-prep-platform/mock_jd.txt"
    print(f"Creating job description from {jd_path}...")
    
    with open(jd_path, "r", encoding="utf-8") as f:
        jd_content = f.read()
        
    jd_res = requests.post(f"{BASE_URL}/job-descriptions", headers=headers, json={
        "title": "Full Stack Engineer",
        "company": "Innovate Corp",
        "rawText": jd_content
    })
    
    if jd_res.status_code not in [200, 201]:
        print(f"JD creation failed: {jd_res.text}")
        sys.exit(1)
        
    jd_data = jd_res.json()
    jd_id = jd_data["id"]
    print(f"JD created successfully! ID: {jd_id}. Status: {jd_data['status']}")
    
    # 6. Poll Job Description for Groq processing
    print("Waiting for Groq AI to process the Job Description...")
    status = "PROCESSING"
    attempts = 0
    jd_parsed = None
    
    while status == "PROCESSING" and attempts < 15:
        time.sleep(3)
        attempts += 1
        check_res = requests.get(f"{BASE_URL}/job-descriptions/{jd_id}", headers=headers)
        if check_res.status_code == 200:
            res_json = check_res.json()
            status = res_json["status"]
            jd_parsed = res_json.get("parsedData")
            print(f"  [Attempt {attempts}] Status: {status}")
        else:
            print(f"  Failed to poll JD status: {check_res.text}")
            break
            
    if status != "COMPLETED":
        print(f"JD parsing did not complete. Final status: {status}")
        sys.exit(1)
        
    print("Groq AI JD Parsing Completed Successfully!")
    print(f"Parsed JD Requirements: {jd_parsed}")
    
    # 7. Analyze Skill Gap
    print(f"Triggering Skill Gap Analysis between Resume {resume_id} and JD {jd_id}...")
    gap_res = requests.post(f"{BASE_URL}/skill-gap/analyze", headers=headers, json={
        "resumeId": resume_id,
        "jobDescId": jd_id
    })
    
    if gap_res.status_code not in [200, 201]:
        print(f"Skill Gap Analysis failed: {gap_res.text}")
        sys.exit(1)
        
    gap_data = gap_res.json()
    print("=== SKILL GAP ANALYSIS RESULTS ===")
    print(f"Match Score: {gap_data['matchScore']}%")
    print(f"Matching Skills: {gap_data['matchingSkills']}")
    print(f"Missing Skills: {gap_data['missingSkills']}")
    print(f"Extra Skills: {gap_data['extraSkills']}")
    print("==================================")
    print("E2E AI FLOW VERIFICATION COMPLETED SUCCESSFULLY!")

if __name__ == "__main__":
    run_test()
