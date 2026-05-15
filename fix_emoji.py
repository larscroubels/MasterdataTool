with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('Overstock op Verkeerde Kar', '&#128230; Overstock op Verkeerde Kar')
content = content.replace('Flow Racks - Kar Bepaling', '&#128722; Flow Racks - Kar Bepaling')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done! Emojis fixed with HTML entities.")
