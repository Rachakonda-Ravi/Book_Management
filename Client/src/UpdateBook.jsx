import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTheme } from './ThemeContext';

const UpdateBook = () => {
    const { isDark } = useTheme();
    const location = useLocation();
    const book = location.state.book;

    const [values, setValues] = useState({
        publisher: book.publisher,
        name: book.name,
        author: book.author,
        date: book.date,
        Cost: book.Cost,
        cover_url: book.cover_url || '',
        stock_status: book.stock_status || 'available'
    });

    const [validated, setValidated] = useState(false);
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState(null);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const validateForm = () => {
        const tempErrors = {};
        if (!values.publisher.trim()) {
            tempErrors.publisher = 'Publisher name is required';
        }
        if (!values.name.trim()) {
            tempErrors.name = 'Book name is required';
        }
        if (!values.author.trim()) {
            tempErrors.author = 'Author name is required';
        }
        if (!values.date) {
            tempErrors.date = 'Publish date is required';
        }
        if (values.Cost === undefined || values.Cost === '') {
            tempErrors.Cost = 'Cost is required';
        } else {
            const costNum = parseFloat(values.Cost);
            if (isNaN(costNum) || costNum < 0) {
                tempErrors.Cost = 'Cost must be a valid positive number';
            }
        }

        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleInputChange = (field, val) => {
        setValues({ ...values, [field]: val });

        if (errors[field]) {
            setErrors({ ...errors, [field]: null });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setApiError(null);
        setValidated(true);

        if (!validateForm()) {
            return;
        }

        const isLoggedIn = localStorage.getItem('is_logged_in') === 'true';
        if (!isLoggedIn) {
            toast.error('Please login first to submit changes');
            navigate('/login');
            return;
        }

        setLoading(true);
        const payload = {
            ...values,
            Cost: parseFloat(values.Cost),
            cover_url: values.cover_url || null
        };

        axios.put(`${import.meta.env.VITE_API_URL}/update/${book.id}`, payload)
            .then(res => {
                toast.success('Book updated successfully');
                navigate('/');
            })
            .catch(err => {
                console.error(err);
                setApiError(err.response?.data?.error || 'Failed to update book. Please verify your authentication.');
            })
            .finally(() => setLoading(false));
    };

    return (
        <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-slate-950' : 'bg-gradient-to-br from-indigo-50 via-white to-cyan-50'}`}>
            <div className="flex justify-center items-center px-4 py-12">
                <div className={`max-w-md w-full rounded-2xl shadow-lg backdrop-blur-sm border p-8 transition-all ${
                    isDark
                        ? 'bg-slate-900/50 border-slate-700'
                        : 'bg-white/80 border-slate-200'
                }`}>
                    <h3 className={`text-2xl font-bold text-center mb-6 ${isDark ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400' : 'text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-600'}`}>
                        Update Book
                    </h3>

                    {apiError && (
                        <div className={`rounded-lg p-4 mb-4 border ${isDark ? 'bg-red-900/20 border-red-800 text-red-300' : 'bg-red-50 border-red-100 text-red-700'}`}>
                            {apiError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} noValidate className="space-y-4">
                        {/* Publisher */}
                        <div>
                            <label htmlFor="publisher" className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Publisher</label>
                            <input
                                type="text"
                                className={`w-full px-3.5 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm transition-all ${
                                    validated && errors.publisher
                                        ? isDark ? 'border-red-500 focus:ring-red-500/20' : 'border-red-500 focus:ring-red-500/20'
                                        : isDark ? 'border-slate-700 bg-slate-800 text-white focus:border-purple-500 focus:ring-purple-500/20' : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/20'
                                }`}
                                placeholder="Enter publisher name"
                                id="publisher"
                                value={values.publisher}
                                onChange={(e) => handleInputChange('publisher', e.target.value)}
                                required
                            />
                            {validated && errors.publisher && (
                                <p className="text-red-500 text-xs mt-1">{errors.publisher}</p>
                            )}
                        </div>

                        {/* Book Name */}
                        <div>
                            <label htmlFor="name" className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Book Name</label>
                            <input
                                type="text"
                                className={`w-full px-3.5 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm transition-all ${
                                    validated && errors.name
                                        ? isDark ? 'border-red-500 focus:ring-red-500/20' : 'border-red-500 focus:ring-red-500/20'
                                        : isDark ? 'border-slate-700 bg-slate-800 text-white focus:border-purple-500 focus:ring-purple-500/20' : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/20'
                                }`}
                                placeholder="Enter book title"
                                id="name"
                                value={values.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                required
                            />
                            {validated && errors.name && (
                                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                            )}
                        </div>

                        {/* Author */}
                        <div>
                            <label htmlFor="author" className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Author</label>
                            <input
                                type="text"
                                className={`w-full px-3.5 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm transition-all ${
                                    validated && errors.author
                                        ? isDark ? 'border-red-500 focus:ring-red-500/20' : 'border-red-500 focus:ring-red-500/20'
                                        : isDark ? 'border-slate-700 bg-slate-800 text-white focus:border-purple-500 focus:ring-purple-500/20' : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/20'
                                }`}
                                placeholder="Enter author name"
                                id="author"
                                value={values.author}
                                onChange={(e) => handleInputChange('author', e.target.value)}
                                required
                            />
                            {validated && errors.author && (
                                <p className="text-red-500 text-xs mt-1">{errors.author}</p>
                            )}
                        </div>

                        {/* Publish Date */}
                        <div>
                            <label htmlFor="date" className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Publish Date</label>
                            <input
                                type="date"
                                className={`w-full px-3.5 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm transition-all ${
                                    validated && errors.date
                                        ? isDark ? 'border-red-500 focus:ring-red-500/20' : 'border-red-500 focus:ring-red-500/20'
                                        : isDark ? 'border-slate-700 bg-slate-800 text-white focus:border-purple-500 focus:ring-purple-500/20' : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/20'
                                }`}
                                id="date"
                                value={values.date}
                                onChange={(e) => handleInputChange('date', e.target.value)}
                                required
                            />
                            {validated && errors.date && (
                                <p className="text-red-500 text-xs mt-1">{errors.date}</p>
                            )}
                        </div>

                        {/* Cost */}
                        <div>
                            <label htmlFor="Cost" className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Cost (₹)</label>
                            <input
                                type="text"
                                className={`w-full px-3.5 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm transition-all ${
                                    validated && errors.Cost
                                        ? isDark ? 'border-red-500 focus:ring-red-500/20' : 'border-red-500 focus:ring-red-500/20'
                                        : isDark ? 'border-slate-700 bg-slate-800 text-white focus:border-purple-500 focus:ring-purple-500/20' : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/20'
                                }`}
                                placeholder="Enter book cost"
                                id="Cost"
                                value={values.Cost}
                                onChange={(e) => handleInputChange('Cost', e.target.value)}
                                required
                            />
                            {validated && errors.Cost && (
                                <p className="text-red-500 text-xs mt-1">{errors.Cost}</p>
                            )}
                        </div>

                        {/* Cover URL */}
                        <div>
                            <label htmlFor="cover_url" className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Cover Image URL (Optional)</label>
                            <input
                                type="url"
                                className={`w-full px-3.5 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm transition-all ${
                                    isDark
                                        ? 'border-slate-700 bg-slate-800 text-white focus:border-purple-500 focus:ring-purple-500/20'
                                        : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/20'
                                }`}
                                placeholder="https://example.com/book-cover.jpg"
                                id="cover_url"
                                value={values.cover_url}
                                onChange={(e) => handleInputChange('cover_url', e.target.value)}
                            />
                            <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Paste a direct link to a book cover image</p>
                        </div>

                        {/* Stock Status */}
                        <div>
                            <label htmlFor="stock_status" className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Stock Status</label>
                            <select
                                id="stock_status"
                                value={values.stock_status}
                                onChange={(e) => handleInputChange('stock_status', e.target.value)}
                                className={`w-full px-3.5 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm transition-all ${
                                    isDark
                                        ? 'border-slate-700 bg-slate-800 text-white focus:border-purple-500 focus:ring-purple-500/20'
                                        : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/20'
                                }`}
                            >
                                <option value="available">Available</option>
                                <option value="borrowed">Borrowed</option>
                                <option value="reading">Reading</option>
                            </select>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4 pt-4">
                            <Link to="/" className={`w-1/2 py-2.5 rounded-lg font-semibold transition-colors text-center border ${
                                isDark
                                    ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
                                    : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                            }`}>
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                className={`w-1/2 py-2.5 rounded-lg font-bold transition-colors flex items-center justify-center ${
                                    isDark
                                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
                                        : 'bg-gradient-to-r from-indigo-600 to-pink-500 text-white hover:from-indigo-700 hover:to-pink-600'
                                }`}
                                disabled={loading}
                            >
                                {loading ? (
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : null}
                                Update
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UpdateBook;
