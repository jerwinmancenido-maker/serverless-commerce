#!/usr/bin/env python3
"""
Reconciliation script:
Updates apps/backend/data/unified-catalog.json so that every single product
contains the full 9-image suite:
  1. slide1_hero.webp
  2. slide2_molecular.webp
  3. slide3_reconstitution.webp
  4. slide4_benefits.webp
  5. slide5_kit.webp
  6. slide6_superapp.webp
  7. variant_vial.webp
  8. variant_vial_bac.webp
  9. variant_complete_set.webp

And every variant contains the exact dedicated variation photo in both its thumbnail
and metadata.image_urls fields.
"""

import os
import json
import re

CATALOG_PATH = "/Users/m5/Projects/serverless-commerce-compound-family/apps/backend/data/unified-catalog.json"

def main():
    if not os.path.exists(CATALOG_PATH):
        print(f"Error: Catalog not found at {CATALOG_PATH}")
        return

    with open(CATALOG_PATH, "r", encoding="utf-8") as f:
        catalog = json.load(f)

    print(f"Loaded {len(catalog)} products from {CATALOG_PATH}")

    updated_count = 0
    variant_updated_count = 0

    for p in catalog:
        # Determine static directory folder
        match = re.search(r'/static/catalog/([^/]+)/', p.get('thumbnail', ''))
        folder = match.group(1) if match else p.get('handle')

        # 1. Update master thumbnail
        p['thumbnail'] = f"http://localhost:9000/static/catalog/{folder}/slide1_hero.webp"

        # 2. Update 9-image array
        p['images'] = [
            f"http://localhost:9000/static/catalog/{folder}/slide1_hero.webp",
            f"http://localhost:9000/static/catalog/{folder}/slide2_molecular.webp",
            f"http://localhost:9000/static/catalog/{folder}/slide3_reconstitution.webp",
            f"http://localhost:9000/static/catalog/{folder}/slide4_benefits.webp",
            f"http://localhost:9000/static/catalog/{folder}/slide5_kit.webp",
            f"http://localhost:9000/static/catalog/{folder}/slide6_superapp.webp",
            f"http://localhost:9000/static/catalog/{folder}/variant_vial.webp",
            f"http://localhost:9000/static/catalog/{folder}/variant_vial_bac.webp",
            f"http://localhost:9000/static/catalog/{folder}/variant_complete_set.webp",
        ]
        updated_count += 1

        # 3. Update variant thumbnails & metadata
        for v in p.get('variants', []):
            title = (v.get('title') or "").lower()
            options_str = " ".join(str(val).lower() for val in (v.get('options') or {}).values())
            combined = f"{title} {options_str}"

            if "subq" in combined or "kit" in combined or "complete" in combined:
                var_thumb = f"http://localhost:9000/static/catalog/{folder}/variant_complete_set.webp"
            elif "bac" in combined or "water" in combined or "reconstitution" in combined or "diluent" in combined:
                var_thumb = f"http://localhost:9000/static/catalog/{folder}/variant_vial_bac.webp"
            else:
                var_thumb = f"http://localhost:9000/static/catalog/{folder}/variant_vial.webp"

            v['thumbnail'] = var_thumb
            if not isinstance(v.get('metadata'), dict):
                v['metadata'] = {}
            v['metadata']['thumbnail'] = var_thumb
            v['metadata']['image_urls'] = [var_thumb]
            variant_updated_count += 1

    # Write back
    with open(CATALOG_PATH, "w", encoding="utf-8") as f:
        json.dump(catalog, f, indent=2)

    print(f"✓ Reconciled {updated_count} products (with 9-image array each)")
    print(f"✓ Reconciled {variant_updated_count} variants with dedicated variant photos")
    print("Catalog reconciliation complete.")

if __name__ == "__main__":
    main()
