#!/usr/bin/env python3
import os
import shutil
import json
from PIL import Image

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
CATALOG_DIR = os.path.join(REPO_ROOT, "apps/backend/static/catalog")
DECKS_DIR = "/Users/m5/Projects/Peptides/output/decks"
STAGING_DIR = "/Users/m5/Projects/Peptides/pepstack-photo-refresh/staging"
UNIFIED_CATALOG_PATH = os.path.join(REPO_ROOT, "apps/backend/data/unified-catalog.json")

MAPPINGS = {
    "semaglutide": {"deck": "semaglutide_5mg"},
    "tb-500": {"deck": "tb_500_10mg"},
    "ghk-basic": {"deck": "ghk_basic_50mg"},
    "pentosan-polysulfate": {"deck": "pentosan_polysulfate_250mg"},
    "mazdutide": {"deck": "mazdutide_10mg"},
    "survodutide": {"deck": "survodutide_10mg"},
    "liraglutide": {"deck": "liraglutide_18mg"},
    "tesofensine": {"deck": "tesofensine_100mg"},
    "adamax-1032": {"deck": "adamax_10mg"},
    "cagrilintide": {"deck": "cagrilintide_5mg"},
    "aod-9604": {"deck": "aod_9604_5mg"},
    "5-amino-1mq": {"deck": "amino_1mq_50mg"},
    "ara-290": {"deck": "ara_290_16mg"},
    "mots-c": {"deck": "mots_c_10mg"},
    "lemon-bottle": {"deck": "lemon_bottle_10ml"},
    "lipo-c-b12": {"deck": "lipo_c_b12_10ml"},
    "rtt60": {"deck": "retatrutide_60mg"},
    "retatrutide": {"deck": "retatrutide_10mg"},
    "aicar": {"deck": "aicar_100mg", "staging": "AR100"},
    "igf-1-lr3": {"deck": "igf_1_lr3_1mg"},
    "igf-des": {"deck": "igf_des_2mg"},
    "cjc-1295-no-dac": {"deck": "cjc_1295_no_dac_5mg"},
    "cjc-1295-with-dac": {"deck": "cjc_1295_with_dac_2mg"},
    "hexarelin": {"deck": "hexarelin_5mg"},
    "sermorelin": {"deck": "sermorelin_5mg"},
    "tesamorelin": {"deck": "tesamorelin_10mg"},
    "foxo4-dri": {"deck": "foxo4_dri_10mg"},
    "humanin": {"deck": "humanin_10mg"},
    "mk-677": {"deck": "mk_677_750mg"},
    "ghrp-2": {"deck": "ghrp_2_10mg"},
    "ghrp-6": {"deck": "ghrp_6_10mg"},
    "ss-31": {"deck": "ss_31_10mg"},
    "pinealon": {"staging": "PIN10"},
    "hcg": {"staging": "G10K"},
    "selank-semax-combo": {"staging": "2S10"}
}

def sync_assets():
    print(f"[*] Starting visual asset synchronization across {len(MAPPINGS)} products...")
    
    synced_count = 0
    for handle, src in MAPPINGS.items():
        target_dir = os.path.join(CATALOG_DIR, handle)
        os.makedirs(target_dir, exist_ok=True)
        
        # 1. If staging photos exist, copy photo1-v2.png -> photo1.png etc.
        if "staging" in src:
            stg_folder = os.path.join(STAGING_DIR, src["staging"])
            if os.path.isdir(stg_folder):
                for i in range(1, 5):
                    stg_src = os.path.join(stg_folder, f"photo{i}-v2.png")
                    stg_dst = os.path.join(target_dir, f"photo{i}.png")
                    if os.path.exists(stg_src):
                        shutil.copy2(stg_src, stg_dst)
                print(f"  [+] Synced staging photos for {handle} (from {src['staging']})")
        
        # 2. If deck exists, copy all slides and generate compatible photo1-4.png
        if "deck" in src:
            deck_folder = os.path.join(DECKS_DIR, src["deck"])
            if os.path.isdir(deck_folder):
                for item in os.listdir(deck_folder):
                    src_file = os.path.join(deck_folder, item)
                    dst_file = os.path.join(target_dir, item)
                    if os.path.isfile(src_file):
                        shutil.copy2(src_file, dst_file)
                
                # If product doesn't have staging photos or we want slide1-4 as photo1-4.png:
                if "staging" not in src:
                    # Map slide1_hero -> photo1.png, slide2_molecular -> photo2.png, etc.
                    slide_map = [
                        ("slide1_hero", "photo1"),
                        ("slide2_molecular", "photo2"),
                        ("slide3_reconstitution", "photo3"),
                        ("slide4_benefits", "photo4"),
                    ]
                    for slide_name, photo_name in slide_map:
                        # Prefer .webp converted to .png, or .jpg converted to .png
                        webp_src = os.path.join(deck_folder, f"{slide_name}.webp")
                        jpg_src = os.path.join(deck_folder, f"{slide_name}.jpg")
                        png_dst = os.path.join(target_dir, f"{photo_name}.png")
                        
                        if os.path.exists(webp_src):
                            try:
                                with Image.open(webp_src) as img:
                                    img.convert("RGB").save(png_dst, "PNG")
                            except Exception as e:
                                if os.path.exists(jpg_src):
                                    with Image.open(jpg_src) as img:
                                        img.convert("RGB").save(png_dst, "PNG")
                        elif os.path.exists(jpg_src):
                            with Image.open(jpg_src) as img:
                                img.convert("RGB").save(png_dst, "PNG")

                print(f"  [+] Synced deck & compatibility photos for {handle} (from {src['deck']})")
        
        synced_count += 1

    print(f"[*] Visual assets synchronized for {synced_count} products.")
    
    # 3. Synchronize unified-catalog.json image entries
    if os.path.exists(UNIFIED_CATALOG_PATH):
        with open(UNIFIED_CATALOG_PATH, "r", encoding="utf-8") as f:
            catalog = json.load(f)
        
        updated_catalog = 0
        for item in catalog:
            handle = item.get("handle")
            target_dir = os.path.join(CATALOG_DIR, handle)
            if not os.path.isdir(target_dir):
                continue
                
            files = sorted(os.listdir(target_dir))
            # Determine existing photos or slides
            photos = [f for f in files if f.startswith("photo") and f.endswith((".png", ".jpg"))]
            slides = [f for f in files if f.startswith("slide") and f.endswith(".webp") and not "thumb" in f]
            
            # If thumbnail is null or images is empty, fix them!
            if not item.get("thumbnail") or not item.get("images") or len(item["images"]) == 0:
                if photos:
                    item["thumbnail"] = f"http://localhost:9000/static/catalog/{handle}/{photos[0]}"
                    item["images"] = [f"http://localhost:9000/static/catalog/{handle}/{p}" for p in photos]
                elif slides:
                    item["thumbnail"] = f"http://localhost:9000/static/catalog/{handle}/{slides[0]}"
                    item["images"] = [f"http://localhost:9000/static/catalog/{handle}/{s}" for s in slides]
                updated_catalog += 1
                print(f"  [+] Updated catalog image entries for {handle}")

        with open(UNIFIED_CATALOG_PATH, "w", encoding="utf-8") as f:
            json.dump(catalog, f, indent=2, ensure_ascii=False)
        print(f"[*] Catalog file updated ({updated_catalog} products received repaired image arrays).")

if __name__ == "__main__":
    sync_assets()
