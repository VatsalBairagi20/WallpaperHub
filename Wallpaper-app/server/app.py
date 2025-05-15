from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from pymongo import MongoClient
import os
from werkzeug.utils import secure_filename
from PIL import Image
import imagehash

app = Flask(__name__)
CORS(app)

# MongoDB config
client = MongoClient('mongodb://localhost:27017/')
db = client['final_wallpaper']
wallpapers_collection = db['wallpapers']

# Folder to store uploaded images
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Utility to compute perceptual hash
def compute_phash(image_path):
    try:
        with Image.open(image_path) as img:
            return imagehash.phash(img)
    except Exception as e:
        print(f"Error computing hash for {image_path}: {e}")
        return None

# Check if two hashes are similar
def is_similar(hash1, hash2, threshold=5):
    return hash1 - hash2 <= threshold

# Remove visually similar images
def filter_similar_wallpapers(wallpapers):
    seen_hashes = []
    unique_wallpapers = []

    for wp in wallpapers:
        image_url = wp.get('image_url', '')
        if not image_url:
            continue
        image_path = image_url.lstrip('/')
        full_path = os.path.join(os.getcwd(), image_path)
        phash = compute_phash(full_path)
        if phash is None:
            continue

        if any(is_similar(phash, h) for h in seen_hashes):
            continue

        seen_hashes.append(phash)
        unique_wallpapers.append(wp)

    return unique_wallpapers

@app.route('/api/upload-wallpaper', methods=['POST'])
def upload_wallpaper():
    try:
        name = request.form.get('name', '').strip()
        description = request.form.get('description', '').strip()
        device = request.form.get('device', '').strip()
        category = request.form.get('category', '').strip()
        new_category = request.form.get('new-category', '').strip()

        if category == 'Create New' and new_category:
            category = new_category

        if not category:
            return jsonify({'error': 'Category name is missing'}), 400

        image = request.files.get('image')
        if not image:
            return jsonify({'error': 'No image uploaded'}), 400

        filename = secure_filename(image.filename)
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        image.save(filepath)

        wallpapers_collection.insert_one({
            'name': name,
            'description': description,
            'category': category,
            'device': device,
            'image_url': f'/uploads/{filename}'
        })

        return jsonify({'message': 'Wallpaper uploaded successfully!'}), 200
    except Exception as e:
        print('UPLOAD ERROR:', str(e))
        return jsonify({'error': 'Something went wrong'}), 500

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

@app.route('/api/get-wallpapers', methods=['GET'])
def get_wallpapers():
    try:
        wallpapers = list(wallpapers_collection.find())
        for wp in wallpapers:
            wp['_id'] = str(wp['_id'])  # Convert ObjectId to string
        unique_wallpapers = filter_similar_wallpapers(wallpapers)
        return jsonify({'wallpapers': unique_wallpapers})
    except Exception as e:
        print('GET WALLPAPERS ERROR:', str(e))
        return jsonify({'error': 'Failed to fetch wallpapers'}), 500

@app.route('/api/get-categories', methods=['GET'])
def get_categories():
    try:
        categories = wallpapers_collection.distinct('category')
        categories = [cat for cat in categories if cat.strip() != '']
        return jsonify({'categories': categories})
    except Exception as e:
        print('GET CATEGORIES ERROR:', str(e))
        return jsonify({'error': 'Failed to fetch categories'}), 500

if __name__ == '__main__':
    app.run(debug=True)
