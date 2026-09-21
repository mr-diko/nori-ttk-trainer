#!/usr/bin/env python3
"""
extract_images.py - Extracts and optimizes dish and set images from 'ТТК NORI.xlsx'
and saves them to 'public/images/dishes/' and 'public/images/sets/'.
"""

import os
import io
import openpyxl
from PIL import Image

EXCEL_PATH = '/Users/admin/Downloads/ТТК NORI.xlsx'
PUBLIC_DIR = '/Users/admin/Downloads/nori-ttk-trainer/public'
DISH_IMG_DIR = os.path.join(PUBLIC_DIR, 'images', 'dishes')
SET_IMG_DIR = os.path.join(PUBLIC_DIR, 'images', 'sets')

MAX_WIDTH = 800
MAX_HEIGHT = 800
JPEG_QUALITY = 82

def optimize_and_save(raw_bytes, target_path):
    os.makedirs(os.path.dirname(target_path), exist_ok=True)
    try:
        im = Image.open(io.BytesIO(raw_bytes))
        # Convert RGBA / P to RGB if necessary
        if im.mode in ('RGBA', 'LA', 'P'):
            bg = Image.new('RGB', im.size, (255, 255, 255))
            if im.mode == 'P':
                im = im.convert('RGBA')
            bg.paste(im, mask=im.split()[-1] if im.mode in ('RGBA', 'LA') else None)
            im = bg
        elif im.mode != 'RGB':
            im = im.convert('RGB')

        im.thumbnail((MAX_WIDTH, MAX_HEIGHT), Image.Resampling.LANCZOS)
        im.save(target_path, format='JPEG', quality=JPEG_QUALITY, optimize=True)
        return True
    except Exception as e:
        print(f"Error saving {target_path}: {e}")
        return False

def extract_all_images():
    print(f"Loading workbook: {EXCEL_PATH} ...")
    wb = openpyxl.load_workbook(EXCEL_PATH)

    dish_sheets = [
        'Філадельфія', 'Уромаки', 'Фірмові роли', 'Каліфорнія', 
        'Футохосомакі', 'Суші-бургери', 'Теплі, запечені, чіз роли', 
        'Рол доги', 'Норі роли', 'Оніґірі', 'Суші та гункани', 'Вегетаріанське АРХІВ'
    ]

    dish_image_map = {} # dish_id -> relative image path
    set_image_map = {}  # set_id -> relative image path

    # 1. Sets
    if 'Набори 2026' in wb.sheetnames:
        sheet = wb['Набори 2026']
        images = getattr(sheet, '_images', [])
        print(f"Found {len(images)} images in 'Набори 2026'")
        
        # Build list of sets
        set_rows = []
        for idx, r in enumerate(sheet.iter_rows()):
            val0 = str(r[0].value).strip() if r[0].value else ''
            if val0 and val0 != 'None':
                set_rows.append((idx, val0.splitlines()[0]))
        
        for i, (idx, name) in enumerate(set_rows):
            set_id = f'set-{i + 1}'
            # Match image with anchor row close to idx - 1
            matched = [img for img in images if hasattr(img.anchor, '_from') and abs(img.anchor._from.row - (idx - 1)) <= 1]
            if matched:
                img = matched[0]
                filename = f"{set_id}.jpg"
                target_path = os.path.join(SET_IMG_DIR, filename)
                rel_path = f"images/sets/{filename}"
                if optimize_and_save(img._data(), target_path):
                    set_image_map[set_id] = rel_path
                    print(f"  Saved Set [{set_id}] '{name}' -> {rel_path}")

    # 2. Dishes
    dish_counter = 1
    for sname in dish_sheets:
        if sname not in wb.sheetnames:
            continue
        sheet = wb[sname]
        images = getattr(sheet, '_images', [])
        
        for idx, r in enumerate(sheet.iter_rows()):
            c0 = r[0] if len(r) > 0 else None
            c1 = r[1] if len(r) > 1 else None
            val0 = str(c0.value).strip() if c0 and c0.value else ''
            val1 = str(c1.value).strip() if c1 and c1.value else ''
            
            if val0 and val0 != 'None':
                dish_id = f'dish-{dish_counter}'
                dish_counter += 1
                
                # Check for matching image
                matched = [img for img in images if hasattr(img.anchor, '_from') and abs(img.anchor._from.row - (idx - 1)) <= 1]
                if matched:
                    img = matched[0]
                    filename = f"{dish_id}.jpg"
                    target_path = os.path.join(DISH_IMG_DIR, filename)
                    rel_path = f"images/dishes/{filename}"
                    if optimize_and_save(img._data(), target_path):
                        dish_image_map[dish_id] = rel_path
                        # print first 5 per category
                        # print(f"  Saved Dish [{dish_id}] '{val0.splitlines()[0]}' -> {rel_path}")

    print(f"\nExtraction complete:")
    print(f"  Dishes with photos: {len(dish_image_map)}")
    print(f"  Sets with photos:   {len(set_image_map)}")
    return dish_image_map, set_image_map

if __name__ == '__main__':
    extract_all_images()
