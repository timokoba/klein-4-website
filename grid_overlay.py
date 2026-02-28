import sys
from PIL import Image, ImageDraw, ImageFont

img_path = sys.argv[1]
out_path = sys.argv[2]
img = Image.open(img_path)
draw = ImageDraw.Draw(img)

w, h = img.size

# Draw a 10x10 grid with numbers
for i in range(11):
    x = int(w * i / 10)
    draw.line((x, 0, x, h), fill="red", width=2)
    # label
    draw.text((x + 5, 5), str(i * 10), fill="red")

for i in range(11):
    y = int(h * i / 10)
    draw.line((0, y, w, y), fill="red", width=2)
    draw.text((5, y + 5), str(i * 10), fill="red")

# Also draw 100x100 grid with thinner lines
for i in range(21):
    x = int(w * i / 20)
    draw.line((x, 0, x, h), fill="yellow", width=1)
for i in range(21):
    y = int(h * i / 20)
    draw.line((0, y, w, y), fill="yellow", width=1)


img.save(out_path)
print(f"Saved {out_path}")
