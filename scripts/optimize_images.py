"""Generate lightweight display images with Pillow; originals remain untouched."""
import json
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets/optimized'


def build():
    OUT.mkdir(exist_ok=True)
    for item in json.loads((ROOT / 'scripts/menu.json').read_text(encoding='utf-8')):
        with Image.open(ROOT / item['image']) as image:
            image = ImageOps.exif_transpose(image).convert('RGB')
            for width in (160, 320):
                ImageOps.fit(image, (width, width), method=Image.Resampling.LANCZOS).save(
                    OUT / f'dish-{item["id"]}-{width}.webp', quality=77, method=6)
    for slug, source, sizes in [('hero', 'bg 1.jpg', (640, 1200)),
                                ('delivery', 'Saad fast food delivery.png', (400, 640))]:
        with Image.open(ROOT / 'assets/images' / source) as original:
            for width in sizes:
                image = ImageOps.exif_transpose(original).convert('RGB')
                image.thumbnail((width, width), Image.Resampling.LANCZOS)
                image.save(OUT / f'{slug}-{width}.webp', quality=80, method=6)
    with Image.open(ROOT / 'assets/images/Saad_fast_food-removebg-preview (1).png') as original:
        image = original.convert('RGBA')
        image = image.crop(image.getbbox())
        image.thumbnail((160, 160), Image.Resampling.LANCZOS)
        image.save(OUT / 'chef.webp', quality=85, method=6)
        image.thumbnail((32, 32), Image.Resampling.LANCZOS)
        image.save(OUT / 'favicon.png', optimize=True)
    print(f'{len(list(OUT.glob("*.webp")))} assets; {sum(p.stat().st_size for p in OUT.glob("*.webp")):,} bytes')


if __name__ == '__main__':
    build()
