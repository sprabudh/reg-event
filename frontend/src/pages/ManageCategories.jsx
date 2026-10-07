import { useCallback, useEffect, useState } from 'react';
import { getCategories, createCategory, deleteCategory } from '../services/categoryService';
import { useConfirm } from '../hooks/useConfirm';
import { CONFIRM_LABELS, ERROR_MESSAGES, PROMPTS } from '../constants';
import { getErrorMessage } from '../utils/errors';

const ManageCategories = () => {
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState('');
    const [error, setError] = useState('');
    const confirm = useConfirm();

    const fetchCategories = useCallback(() => {
        getCategories()
            .then(res => setCategories(res.data))
            .catch(() => setError(ERROR_MESSAGES.LOAD_CATEGORIES_FAILED));
    }, []);

    // Role is enforced by RoleRoute in App.jsx, so this no longer needs to
    // check it -- that check ran after the first render, which briefly showed
    // the admin form to a non-admin before bouncing them away.
    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleAdd = (e) => {
        e.preventDefault();
        createCategory({ name: newCategory }).then(() => {
            setNewCategory('');
            setError('');
            fetchCategories();
        }).catch(err => setError(getErrorMessage(err, ERROR_MESSAGES.ADD_CATEGORY_FAILED)));
    };

    const handleDelete = async (id) => {
        const confirmed = await confirm({
            message: PROMPTS.DELETE_CATEGORY,
            confirmLabel: CONFIRM_LABELS.DELETE_CATEGORY,
            tone: 'danger'
        });
        if (!confirmed) return;

        deleteCategory(id).then(() => fetchCategories())
            .catch(err => setError(getErrorMessage(err, ERROR_MESSAGES.DELETE_CATEGORY_IN_USE)));
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
