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

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleAdd = (e) => {
        e.preventDefault();

        // Custom UI validation to replace the Windows/Browser popup
        if (!newCategory.trim()) {
            setError('Category name is required.');
            return;
        }

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

            {/* Shows the UI error instead of the browser popup */}
            {error && <div className="mc-error" style={{ color: '#ef4444', backgroundColor: '#fee2e2', padding: '10px', borderRadius: '6px', marginBottom: '15px' }}>⚠️ {error}</div>}

            {/* Added noValidate to disable the default browser popup */}
            <form onSubmit={handleAdd} className="mc-form" noValidate>
                <input
                    type="text"
                    value={newCategory}
                    onChange={e => {
                        setNewCategory(e.target.value);
                        // Clear the error message instantly when the user starts typing
                        if (error) setError('');
                    }}
                    required
                    placeholder="New category name..."
                    className={`mc-input ${error ? 'input-error' : ''}`}
                    style={error ? { border: '1px solid #ef4444' } : {}}
                />
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