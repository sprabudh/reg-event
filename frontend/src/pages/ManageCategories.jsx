import { useState, useEffect } from 'react';
import { getCategories, createCategory, deleteCategory } from '../services/categoryService';
import { getUserRole } from '../services/authService';
import { useNavigate } from 'react-router-dom';

const ManageCategories = () => {
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (getUserRole() !== 'ADMIN') navigate('/events');
        fetchCategories();
    }, [navigate]);

    const fetchCategories = () => {
        getCategories().then(res => setCategories(res.data)).catch(() => setError("Failed to load"));
    };

    const handleAdd = (e) => {
        e.preventDefault();
        createCategory({ name: newCategory }).then(() => {
            setNewCategory('');
            setError('');
            fetchCategories();
        }).catch(err => setError(err.response?.data || "Failed to add category"));
    };

    const handleDelete = (id) => {
        if(window.confirm("Delete this category?")) {
            deleteCategory(id).then(() => fetchCategories())
                .catch(err => setError(err.response?.data || "Cannot delete category in use."));
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <h2>Manage Event Categories</h2>
            {error && <div style={{ color: 'red', marginBottom: '10px' }}>⚠️ {error}</div>}

            <form onSubmit={handleAdd} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <input type="text" value={newCategory} onChange={e => setNewCategory(e.target.value)} required placeholder="New category name..." style={{ padding: '8px', flex: 1 }}/>
                <button type="submit" className="btn">+ Add</button>
            </form>

            <ul style={{ listStyle: 'none', padding: 0 }}>
                {categories.map(cat => (
                    <li key={cat.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #ddd' }}>
                        {cat.name}
                        <button onClick={() => handleDelete(cat.id)} className="btn btn-small btn-danger">Remove</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};
export default ManageCategories;