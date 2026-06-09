#!/usr/bin/env python3
"""
Generate all game and landing page images using MiniMax API.
Downloads images immediately before URLs expire.
"""
import urllib.request
import urllib.parse
import json
import os
import time

API_KEY = os.environ.get('MINIMAX_API_KEY', '')
API_URL = 'https://api.minimaxi.chat/v1/image_generation'

PROMPTS = {
    # Landing page
    'landing/hero': {
        'prompt': 'Dark cyberpunk mystical scene, a massive glowing cyan crystal hexagon floating in a void, digital grid lines, binary code rain, tiny glowing particles, deep black background with subtle blue gradient, neon cyan (#00f0ff) accents, ethereal magical energy, sci-fi fantasy art style, cinematic lighting, 8k quality',
        'aspect_ratio': '16:9',
    },
    'landing/feature-workstations': {
        'prompt': 'Five glowing elemental crystals arranged in a network, each a different color: red fire crystal, blue water crystal, green wind crystal, purple crystal gem, golden aether crystal. Dark space background, energy lines connecting them, neon glow, cyber-mystic digital art style, cyan grid overlay',
        'aspect_ratio': '3:2',
    },
    'landing/feature-spells': {
        'prompt': 'Magical spell compilation ritual, concentric glowing magenta hexagonal rings rotating, sparks and particles emanating outward, dark void background, runic symbols floating, neon magenta and cyan energy, cyber-mystic digital art, cinematic',
        'aspect_ratio': '3:2',
    },
    'landing/feature-meditation': {
        'prompt': 'Four vertical glowing preservation chambers in a row, each containing a different colored energy: red fire, blue water, green wind, purple crystal. Digital readouts, energy levels visible, dark futuristic laboratory, gold accent lighting, cyber-mystic art style',
        'aspect_ratio': '3:2',
    },
    # Workstation backgrounds
    'workstations/fire-forge': {
        'prompt': 'A blazing digital forge chamber, molten red-orange fire energy crystallized into data structures, lava-like glow, dark industrial background, hexagonal metal framework, sparks flying, cyber-mystic digital art, warm red lighting',
        'aspect_ratio': '16:9',
    },
    'workstations/aqua-well': {
        'prompt': 'A deep blue digital well of flowing water energy, liquid data streams spiraling downward, bioluminescent blue glow, dark underwater cavern feeling, hexagonal containment ring, cyber-mystic digital art, cool blue lighting',
        'aspect_ratio': '16:9',
    },
    'workstations/zephyr-generator': {
        'prompt': 'A green wind energy generator, swirling air currents forming a tornado of light, floating debris and leaves made of code, dark stormy background, hexagonal turbine structure, cyber-mystic digital art, green neon glow',
        'aspect_ratio': '16:9',
    },
    'workstations/crystal-chamber': {
        'prompt': 'A purple crystal growth chamber, large amethyst-like crystals forming from digital code, refracting purple light, dark cave background, hexagonal lattice structure, cyber-mystic digital art, purple neon glow',
        'aspect_ratio': '16:9',
    },
    'workstations/aether-synthesizer': {
        'prompt': 'A golden aether synthesis chamber, all four elemental colors (red, blue, green, purple) merging into a brilliant white-gold energy at the center, particle accelerator aesthetic, dark sci-fi background, hexagonal reactor, cyber-mystic digital art',
        'aspect_ratio': '16:9',
    },
    # Game icons
    'game/cast-button': {
        'prompt': 'A glowing cyan circular spell casting button icon, lightning bolt symbol in center, hexagonal border, magical energy aura, dark background, neon cyan glow, game UI asset, clean crisp edges, transparent background feeling',
        'aspect_ratio': '1:1',
    },
    'game/avatar': {
        'prompt': 'Mysterious hooded figure with glowing cyan eyes, dark cloak, face hidden in shadow, floating hexagonal runes around head, dark void background, neon cyan accent lighting, cyber-mystic character portrait, game avatar, symmetrical composition',
        'aspect_ratio': '1:1',
    },
    'game/badge-bronze': {
        'prompt': 'Bronze star achievement badge, metallic bronze color, five pointed star shape, subtle glow, dark background, game UI asset, clean icon design',
        'aspect_ratio': '1:1',
    },
    'game/badge-silver': {
        'prompt': 'Silver star achievement badge, metallic silver color, five pointed star shape, subtle glow, dark background, game UI asset, clean icon design',
        'aspect_ratio': '1:1',
    },
    'game/badge-gold': {
        'prompt': 'Gold star achievement badge, metallic gold color, five pointed star shape, warm glow, dark background, game UI asset, clean icon design',
        'aspect_ratio': '1:1',
    },
    'game/badge-platinum': {
        'prompt': 'Platinum diamond achievement badge, shiny platinum silver color, diamond crystal shape, cool glow, dark background, game UI asset, clean icon design',
        'aspect_ratio': '1:1',
    },
}

def generate_image(name, config):
    print(f"  Generating {name}...")
    payload = json.dumps({
        'model': 'image-01',
        'prompt': config['prompt'],
        'aspect_ratio': config.get('aspect_ratio', '1:1'),
        'n': 1,
    }).encode('utf-8')

    req = urllib.request.Request(API_URL, data=payload, method='POST')
    req.add_header('Authorization', f'Bearer {API_KEY}')
    req.add_header('Content-Type', 'application/json')

    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            data = json.loads(resp.read().decode('utf-8'))
    except Exception as e:
        print(f"    API error: {e}")
        return False

    if data.get('base_resp', {}).get('status_code', -1) != 0:
        print(f"    API failed: {data}")
        return False

    urls = data.get('data', {}).get('image_urls', [])
    if not urls:
        print(f"    No image URLs returned")
        return False

    img_url = urls[0]
    out_dir = f"images/generated/{os.path.dirname(name)}"
    os.makedirs(out_dir, exist_ok=True)
    out_path = f"images/generated/{name}.jpg"

    # Download immediately
    try:
        dl_req = urllib.request.Request(img_url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(dl_req, timeout=30) as img_resp:
            with open(out_path, 'wb') as f:
                f.write(img_resp.read())
        print(f"    Saved {out_path}")
        return True
    except Exception as e:
        print(f"    Download failed: {e}")
        return False

def main():
    if not API_KEY:
        print("Error: MINIMAX_API_KEY not set")
        return

    os.makedirs('images/generated', exist_ok=True)
    success = 0
    failed = 0

    for name, config in PROMPTS.items():
        if generate_image(name, config):
            success += 1
        else:
            failed += 1
        time.sleep(1.5)  # Rate limit courtesy

    print(f"\nDone: {success} generated, {failed} failed")

if __name__ == '__main__':
    main()
