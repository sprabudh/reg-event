import { useCallback, useEffect, useState } from 'react';
import { getCategories, createCategory, deleteCategory } from '../services/categoryService';
import { useConfirm } from '../hooks/useConfirm';
import useFlash from '../hooks/useFlash';
import {
    CONFIRM_LABELS,
    ERROR_MESSAGES,
    FORM_LABELS,
    PROMPTS,
    SUCCESS_MESSAGES
} from '../constants';
import { getErrorMessage } from '../utils/errors';

const ManageCategories = () => {
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState('');
    const [error, setError] = useState('');
    // Scoped separately from `error`: the text field was outlined red for
    // unrelated failures such as a failed delete or a failed load.
    const [nameError, setNameError] = useState('');
    const [loading, setLoading] = useState(true);
    const [busyIds, setBusyIds] = useState([]);
    const [success, flash] = useFlash();
    const confirm = useConfirm();

    const fetchCategories = useCallback(() => {
        getCategories()
            .then(res => { setCategories(res.data || []); setError(''); })
            .catch(() => setError(ERROR_MESSAGES.LOAD_CATEGORIES_FAILED))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleAdd = (e) => {
        e.preventDefault();

        // Client-side validation replaces the native browser popup
        if (!newCategory.trim()) {
            setNameError(ERROR_MESSAGES.CATEGORY_NAME_REQUIRED);
            return;
        }

        createCategory({ name: newCategory })
            .then(() => {
                setNewCategory('');
                setError('');
                setNameError('');
                flash(SUCCESS_MESSAGES.ADD_CATEGORY_OK);
                fetchCategories();
            })
            .catch(err => setError(getErrorMessage(err, ERROR_MESSAGES.ADD_CATEGORY_FAILED)));
    };

    const handleDelete = async (id) => {
        const confirmed = await confirm({
            message: PROMPTS.DELETE_CATEGORY,
            confirmLabel: CONFIRM_LABELS.DELETE_CATEGORY,
            tone: 'danger'
        });
        if (!confirmed) return;

        setBusyIds((prev) => [...prev, id]);
        deleteCategory(id)
            .then(() => { flash(SUCCESS_MESSAGES.DELETE_CATEGORY_OK); fetchCategories(); })
            .catch(err => setError(getErrorMessage(err, ERROR_MESSAGES.DELETE_CATEGORY_IN_USE)))
            .finally(() => setBusyIds((prev) => prev.filter((x) => x !== id)));
    };

    return (
        <div className="mc-wrap">
            <h2>Manage Event Categories</h2>

            {error && <div className="mc-error" role="alert">{error}</div>}
            {success && <div className="alert-success" role="status">{success}</div>}

            <form onSubmit={handleAdd} className="mc-form" noValidate>
                <input
                    type="text"
                    value={newCategory}
                    onChange={e => {
                        setNewCategory(e.target.value);
                        if (nameError) setNameError('');
                    }}
                    required
                    aria-label={FORM_LABELS.CATEGORY_NAME || 'New category name'}
                    placeholder="New category name..."
                    className={`mc-input ${nameError ? 'input-error' : ''}`}
                />
                <button type="submit" className="btn">+ Add</button>
            </form>
            {nameError && <div className="mc-name-error" role="alert">{nameError}</div>}

            {loading ? (
                <p className="mc-empty">Loading categories...</p>
            ) : categories.length === 0 ? (
                <p className="mc-empty">
                    No categories yet. Add one above to make it available when creating events.
                </p>
            ) : (
                <ul className="mc-list">
                    {categories.map(cat => (
                        <li key={cat.id} className="mc-item">
                            {cat.name}
                            <button
                                type="button"
                                onClick={() => handleDelete(cat.id)}
                                disabled={busyIds.includes(cat.id)}
                                className="btn btn-small btn-danger"
                            >
                                Remove
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ManageCategories;