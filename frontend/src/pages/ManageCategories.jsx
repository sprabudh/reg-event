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
        <div className="mc-wrap">
            <h2>Manage Event Categories</h2>
            {error && <div className="mc-error">⚠️ {error}</div>}

            <form onSubmit={handleAdd} className="mc-form">
                <input type="text" value={newCategory} onChange={e => setNewCategory(e.target.value)} required placeholder="New category name..." className="mc-input"/>
                <button type="submit" className="btn">+ Add</button>
            </form>

            <ul className="mc-list">
                {categories.map(cat => (
                    <li key={cat.id} className="mc-item">
                        {cat.name}
                        <button onClick={() => handleDelete(cat.id)} className="btn btn-small btn-danger">Remove</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};
export default ManageCategories;