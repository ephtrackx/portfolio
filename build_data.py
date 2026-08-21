import csv
import json
import os
import glob

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_FILE = os.path.join(BASE_DIR, 'data.json')

def clean_row(row):
    return {k.strip(): v.strip() if isinstance(v, str) else v for k, v in row.items() if k}

def find_file_path(subfolder, filename_no_ext):
    """Шукає файл з будь-яким графічним розширенням у підпапці img/{subfolder}/"""
    valid_exts = ['.jpg', '.jpeg', '.png', '.webp']
    folder_path = os.path.join(BASE_DIR, 'img', subfolder)
    
    if os.path.exists(folder_path):
        for ext in valid_exts:
            full_path = os.path.join(folder_path, f"{filename_no_ext}{ext}")
            if os.path.exists(full_path):
                return f"img/{subfolder}/{filename_no_ext}{ext}"
    return None

def process_structure(file_path):
    structure = []
    with open(file_path, mode='r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        for row in reader:
            cleaned = clean_row(row)
            if cleaned.get('Enabled', '').upper() in ['TRUE', '1', 'YES']:
                structure.append({
                    'page_id': cleaned.get('Page_ID'),
                    'menu_title_en': cleaned.get('Menu_Title_EN') or cleaned.get('Menu_Title'),
                    'menu_title_ua': cleaned.get('Menu_Title_UA') or cleaned.get('Menu_Title'),
                    'page_type': cleaned.get('Page_Type'),
                    'target_sheet': cleaned.get('Target_Sheet'),
                    'order': int(cleaned.get('Order', 99))
                })
    structure.sort(key=lambda x: x['order'])
    return structure

def process_docs(file_path):
    docs = []
    with open(file_path, mode='r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        for row in reader:
            cleaned = clean_row(row)
            project_id = (cleaned.get('Project_ID') or cleaned.get('ID') or '').strip()

            cover_en = cleaned.get('Cover_Image') or cleaned.get('Cover_Image_EN')
            cover_ua = cleaned.get('Cover_Image_UA')

            if project_id:
                # 1. Пошук у відповідних підпапках
                found_en = find_file_path('doc', project_id)
                found_ua = find_file_path('doc-ua', f"{project_id}-ua") or find_file_path('doc-ua', project_id)

                # 2. Якщо в CSV не заповнено вручну — беремо знайдений файл
                if not cover_en:
                    cover_en = found_en or found_ua or f"img/doc/{project_id}.jpg"
                
                if not cover_ua:
                    cover_ua = found_ua or found_en or cover_en

            docs.append({
                'project_id': project_id,
                'title_en': cleaned.get('Title_EN') or cleaned.get('Title'),
                'title_ua': cleaned.get('Title_UA') or cleaned.get('Title'),
                'year': cleaned.get('Year'),
                'role_en': cleaned.get('Role_EN') or cleaned.get('Role'),
                'role_ua': cleaned.get('Role_UA') or cleaned.get('Role'),
                'description_en': cleaned.get('Description_EN') or cleaned.get('Description'),
                'description_ua': cleaned.get('Description_UA') or cleaned.get('Description'),
                'cover_image_en': cover_en,
                'cover_image_ua': cover_ua,
                'video_url': cleaned.get('Video_URL'),
                'external_link': cleaned.get('External_Link'),
                'featured': cleaned.get('Featured', '').upper() in ['TRUE', '1', 'YES'],
                'order': int(cleaned.get('Order', 99))
            })
    docs.sort(key=lambda x: x['order'])
    return docs

def process_music(file_path):
    music = []
    with open(file_path, mode='r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        for row in reader:
            cleaned = clean_row(row)
            track_id = (cleaned.get('Track_ID') or cleaned.get('ID') or '').strip()

            cover_image = cleaned.get('Cover_Image')
            if not cover_image and track_id:
                cover_image = find_file_path('mus', track_id) or f"img/mus/{track_id}.jpg"

            rel_en = cleaned.get('Release_Type_EN') or cleaned.get('Release_Type') or cleaned.get('Type') or cleaned.get('Album_Name')
            rel_ua = cleaned.get('Release_Type_UA') or cleaned.get('Release_Type') or cleaned.get('Type') or cleaned.get('Album_Name')

            music.append({
                'track_id': track_id,
                'title': cleaned.get('Title'),
                'release_date': cleaned.get('Release_Date'),
                'release_type_en': rel_en,
                'release_type_ua': rel_ua,
                'author': cleaned.get('Author', '').strip(),
                'cover_image': cover_image,
                'youtube_url': cleaned.get('Youtube_URL'),
                'soundcloud_url': cleaned.get('Soundcloud_URL'),
                'bandcamp_url': cleaned.get('Bandcamp_URL'),
                'order': int(cleaned.get('Order', 99))
            })
    music.sort(key=lambda x: x['order'])
    return music

def parse_work_lines(raw_text):
    work_list = []
    if not raw_text:
        return work_list
    lines = [line.strip() for line in raw_text.split('\n') if line.strip()]
    for line in lines:
        if ' – ' in line:
            parts = line.split(' – ', 1)
        elif ' - ' in line:
            parts = line.split(' - ', 1)
        elif '–' in line:
            parts = line.split('–', 1)
        else:
            parts = ['', line]
        period = parts[0].strip() if len(parts) > 1 else ''
        title = parts[1].strip() if len(parts) > 1 else line
        work_list.append({'period': period, 'title': title})
    return work_list

def process_about(file_path):
    about_data = {}
    with open(file_path, mode='r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        for row in reader:
            cleaned = clean_row(row)
            key = cleaned.get('Key')
            val = cleaned.get('Value')
            if key and val:
                about_data[key] = val

    work_en_raw = about_data.get('bio_work_en') or about_data.get('bio_work', '')
    work_ua_raw = about_data.get('bio_work_ua') or about_data.get('bio_work', '')

    about_data['work_history_en'] = parse_work_lines(work_en_raw)
    about_data['work_history_ua'] = parse_work_lines(work_ua_raw)

    photos = []
    valid_extensions = ('.jpg', '.jpeg', '.png', '.webp')
    bio_dir = os.path.join(BASE_DIR, 'img', 'bio')
    
    if os.path.exists(bio_dir):
        found_files = [
            f for f in os.listdir(bio_dir)
            if f.lower().startswith('bio-') and f.lower().endswith(valid_extensions)
        ]
        found_files.sort()
        photos = [f"img/bio/{f}" for f in found_files]

    about_data['photos'] = photos
    return about_data

def build_portfolio():
    data = {'navigation': [], 'pages': {}}
    csv_files = glob.glob(os.path.join(BASE_DIR, '*.csv'))

    for f in csv_files:
        filename = os.path.basename(f)
        if 'Site_Structure' in filename:
            data['navigation'] = process_structure(f)
        elif 'Sheet_Docs' in filename:
            data['pages']['docs'] = process_docs(f)
        elif 'Sheet_Music' in filename:
            data['pages']['music'] = process_music(f)
        elif 'Sheet_About' in filename:
            data['pages']['about'] = process_about(f)

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"Успішно оновлено {OUTPUT_FILE}")

if __name__ == '__main__':
    build_portfolio()