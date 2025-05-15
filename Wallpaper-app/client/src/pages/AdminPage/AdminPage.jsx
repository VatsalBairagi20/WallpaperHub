import React, { useState, useEffect } from 'react';
import './AdminPage.css';

const AdminPage = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [device, setDevice] = useState('pc');
  const [image, setImage] = useState(null);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/get-categories')
      .then((res) => res.json())
      .then((data) => {
        setCategories(data.categories || []);
      })
      .catch((err) => console.error('Error fetching categories:', err));
  }, []);

  const handleCategoryChange = (e) => {
    const selected = e.target.value;
    setCategory(selected);
    setShowNewCategory(selected === 'Create New');
  };

  const handleFileChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('device', device);
    formData.append('image', image);

formData.append('category', category);
formData.append('new-category', newCategory);


    try {
      const response = await fetch('http://localhost:5000/api/upload-wallpaper', {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const result = await response.json();
      alert(result.message || 'Wallpaper uploaded successfully');

      if (category === 'Create New') {
        const refresh = await fetch('http://localhost:5000/api/get-categories');
        const refreshedData = await refresh.json();
        setCategories(refreshedData.categories || []);
      }
    } catch (error) {
      alert('Error uploading wallpaper');
      console.error(error);
    }
  };

  return (
    <div className="admin-container">
      <h1 className="admin-title">Admin Panel - Upload Wallpaper</h1>
      <form className="admin-form" onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="admin-form-group">
          <label className="admin-label">Wallpaper Name:</label>
          <input className="admin-input" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>

        <div className="admin-form-group">
          <label className="admin-label">Description:</label>
          <textarea className="admin-textarea" value={description} onChange={(e) => setDescription(e.target.value)} required />
        </div>

        <div className="admin-form-group">
          <label className="admin-label">Category:</label>
          <select className="admin-select" value={category} onChange={handleCategoryChange} required>
            <option value="">Select a category</option>
            {categories.map((cat, idx) => (
              <option key={idx} value={cat}>
                {cat}
              </option>
            ))}
            <option value="Create New">Create New</option>
          </select>
        </div>

        {showNewCategory && (
          <div className="admin-form-group">
            <label className="admin-label">New Category Name:</label>
            <input className="admin-input" type="text" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} required />
          </div>
        )}

        <div className="admin-form-group">
          <label className="admin-label">Device:</label>
          <select className="admin-select" value={device} onChange={(e) => setDevice(e.target.value)} required>
            <option value="pc">PC</option>
            <option value="mobile">Mobile</option>
          </select>
        </div>

        <div className="admin-form-group">
          <label className="admin-label">Upload Image:</label>
          <input className="admin-file-input" type="file" onChange={handleFileChange} required />
        </div>

        <button className="admin-submit-btn" type="submit">Upload Wallpaper</button>
      </form>
    </div>
  );
};

export default AdminPage;
