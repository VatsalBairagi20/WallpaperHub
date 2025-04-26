
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import os
from werkzeug.utils import secure_filename
from flask import send_from_directory

app = Flask(__name__)
CORS(app)

# MongoDB config
client = MongoClient('mongodb://localhost:27017/')
db = client['final_wallpaper']
wallpapers_collection = db['wallpapers']

# Folder to store uploaded images
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/api/upload-wallpaper', methods=['POST'])
def upload_wallpaper():
    try:
        name = request.form.get('name')
        description = request.form.get('description')
        device = request.form.get('device')
        category = request.form.get('category')
        new_category = request.form.get('new-category')
        if category == 'Create New':
            category = new_category

        image = request.files.get('image')
        if not image:
            return jsonify({'error': 'No image uploaded'}), 400

        filename = secure_filename(image.filename)
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        image.save(filepath)

        # Save info to MongoDB
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
            wp['_id'] = str(wp['_id'])  # convert ObjectId to string
        return jsonify({'wallpapers': wallpapers})
    except Exception as e:
        print('GET WALLPAPERS ERROR:', str(e))
        return jsonify({'error': 'Failed to fetch wallpapers'}), 500


@app.route('/api/get-categories', methods=['GET'])
def get_categories():
    try:
        categories = wallpapers_collection.distinct('category')
        return jsonify({'categories': categories})
    except Exception as e:
        print('GET CATEGORIES ERROR:', str(e))
        return jsonify({'error': 'Failed to fetch categories'}), 500


if __name__ == '__main__':
    app.run(debug=True)


