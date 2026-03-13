import os
import re

file_path = r'c:\Users\evince\Downloads\Kimi_Agent_Strategic Pathways Onboarding Video\app\src\sections\AdminDashboard.tsx'

# Original block pattern to match
# Using re.DOTALL to match across lines and re.ESCAPE for the static parts
pattern = r"const \{ data: appData \} = appSource === 'profile' \s+\? await supabase\.from\('profiles'\)\.select\('id'\)\.eq\('id', id\)\.single\(\)\s+: await supabase\.from\('verification_documents'\)\.select\('user_id'\)\.eq\('id', id\)\.single\(\);\s+const targetUserId = appSource === 'profile' \? id : appData\?\.user_id;"

# Replacement block
replacement = r"let targetUserId = id; if (appSource !== 'profile') { const { data: appData } = await supabase.from('verification_documents').select('user_id').eq('id', id).single(); targetUserId = appData?.user_id; }"

try:
    # First, let's read the file using latin-1 which is binary-safe and then decode carefully
    with open(file_path, 'rb') as f:
        bytes_content = f.read()
    
    # Try decoding as UTF-16 LE
    try:
        content = bytes_content.decode('utf-16')
    except:
        content = bytes_content.decode('utf-8', errors='ignore')

    # Apply the fix using regex for both occurrences
    # We'll be a bit more flexible with whitespace
    new_content = re.sub(
        r"const \{ data: appData \} = appSource === 'profile'\s*\? await supabase\.from\('profiles'\)\.select\('id'\)\.eq\('id', id\)\.single\(\)\s*: await supabase\.from\('verification_documents'\)\.select\('user_id'\)\.eq\('id', id\)\.single\(\);\s+const targetUserId = appSource === 'profile' \? id : appData\?\.user_id;",
        replacement,
        content
    )

    if new_content == content:
        print("No matches found for replacement pattern")
        # Try a simpler match if the complex one failed
        new_content = content.replace(
            "const targetUserId = appSource === 'profile' ? id : appData?.user_id;",
            replacement
        )
        if new_content == content:
             print("Simpler replacement also failed")
        else:
             print("Successfully applied simpler replacement")
    else:
        print("Successfully applied complex replacement")

    # Write back as UTF-8
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Successfully saved file as UTF-8")

except Exception as e:
    print(f"Error: {e}")
