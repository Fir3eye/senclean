# Case-insensitive replacement of 'safsafaiwala' to 'Senclean' in current directory (recursively)

# Dry run (see files that would change)
grep -Rlin --exclude-dir=node_modules --exclude=package-lock.json 'safsafaiwala' .

# Replace lowercase/uppercase variants
grep -Rli --exclude-dir=node_modules --exclude=package-lock.json 'safsafaiwala' . | xargs sed -i 's/safsafaiwala/Senclean/g'
grep -Rli --exclude-dir=node_modules --exclude=package-lock.json 'SafSafaiWala' . | xargs sed -i 's/SafSafaiWala/Senclean/g'
grep -Rli --exclude-dir=node_modules --exclude=package-lock.json 'Safsafaiwala' . | xargs sed -i 's/Safsafaiwala/Senclean/g'
