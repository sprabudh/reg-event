import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCategories, createCategory, deleteCategory } from '../services/categoryService';
import { getUserRole } from '../services/authService';
import { APP_ROUTES, ERROR_MESSAGES, PROMPTS, ROLES } from '../constants';
import { getErrorMessage } from '../utils/errors';

const ManageCategories = () => {
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const fetchCategories = useCallback(() => {
        getCategories()
            .then(res => setCategories(res.data))
            .catch(() => setError(ERROR_MESSAGES.LOAD_CATEGORIES_FAILED));
    }, []);

    useEffect(() => {
        if (getUserRole() !== ROLES.ADMIN) {
            navigate(APP_ROUTES.EVENTS);
            return;
        }
        fetchCategories();
    }, [navigate, fetchCategories]);

    const handleAdd = (e) => {
        e.preventDefault();
        createCategory({ name: newCategory }).then(() => {
            setNewCategory('');
            setError('');
            fetchCategories();
        }).catch(err => setError(getErrorMessage(err, ERROR_MESSAGES.ADD_CATEGORY_FAILED)));
    };

    const handleDelete = (id) => {
        if (window.confirm(PROMPTS.DELETE_CATEGORY)) {
            deleteCategory(id).then(() => fetchCategories())
                .catch(err => setError(getErrorMessage(err, ERROR_MESSAGES.DELETE_CATEGORY_IN_USE)));
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
