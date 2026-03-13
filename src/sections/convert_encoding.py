import os

file_path = r'c:\Users\evince\Downloads\Kimi_Agent_Strategic Pathways Onboarding Video\app\src\sections\AdminDashboard.tsx'

try:
    # Try reading as UTF-16
    with open(file_path, 'r', encoding='utf-16') as f:
        content = f.read()
    
    # Write back as UTF-8
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Successfully converted to UTF-8")
except Exception as e:
    print(f"Error: {e}")
