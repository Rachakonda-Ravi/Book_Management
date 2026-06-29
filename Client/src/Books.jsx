import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useTheme } from './ThemeContext';

const Books = () => {
    const { isDark } = useTheme();
    const [books, setBooks] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Pagination
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(12);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // Filters
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('author');
    const [sortOrder, setSortOrder] = useState('asc');
    const [authorFilter, setAuthorFilter] = useState('');
    const [publisherFilter, setPublisherFilter] = useState('');
    const [stockFilter, setStockFilter] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [minDate, setMinDate] = useState('');
    const [maxDate, setMaxDate] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    const handleUpdate = (book) => {
        const isLoggedIn = localStorage.getItem('is_logged_in') === 'true';
        if (!isLoggedIn) {
            toast.error('Please login first to edit a book');
            navigate('/login?next=/');
            return;
        }
        navigate('/update', { state: { book } });
    };

    const handleDelete = (bookId) => {
        const isLoggedIn = localStorage.getItem('is_logged_in') === 'true';
        if (!isLoggedIn) {
            toast.error('Please login first to delete a book');
            navigate('/login?next=/');
            return;
        }
        axios.delete(`${import.meta.env.VITE_API_URL}/delete/${bookId}`)
            .then(() => {
                fetchBooks();
                toast.success('Book deleted successfully');
            })
            .catch(err => {
                console.error(err);
                setError(err.response?.data?.error || 'Failed to delete book');
            });
    };

    const fetchBooks = () => {
        setLoading(true);
        setError(null);
        
        const params = new URLSearchParams({
            page,
            page_size: pageSize,
            sort_by: sortBy,
            order: sortOrder,   
            search,
            author: authorFilter,
            publisher: publisherFilter,
            stock_status: stockFilter,
            ...(minPrice && { min_price: minPrice }),
            ...(maxPrice && { max_price: maxPrice }),
            ...(minDate && { min_date: minDate }),
            ...(maxDate && { max_date: maxDate })
        });

        const url = `${import.meta.env.VITE_API_URL}?${params.toString()}`;
        console.log('Fetching from:', url);
        
        axios.get(url)
            .then(res => {
                console.log('Response:', res.data);
                if (res.data && res.data.books) {
                    setBooks(res.data.books);
                    setTotal(res.data.total);
                    setTotalPages(res.data.total_pages);
                } else {
                    setBooks([]);
                    setTotal(0);
                    setTotalPages(0);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error('Fetch error:', err);
                setError('Could not fetch books: ' + (err.response?.data?.detail || err.message));
                setBooks([]);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchBooks();
    }, [page, pageSize, sortBy, sortOrder, search, authorFilter, publisherFilter, stockFilter, minPrice, maxPrice, minDate, maxDate]);

    const handleExport = () => {
        axios.get(`${import.meta.env.VITE_API_URL}/export`)
            .then(res => {
                const element = document.createElement('a');
                element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(res.data.csv));
                element.setAttribute('download', res.data.filename);
                element.style.display = 'none';
                document.body.appendChild(element);
                element.click();
                document.body.removeChild(element);
                toast.success('Books exported successfully');
            })
            .catch(err => {
                console.error(err);
                toast.error('Failed to export books');
            });
    };

    const handleImport = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const csvData = event.target.result;
            axios.post(`${import.meta.env.VITE_API_URL}/bulk-import?csv_data=${encodeURIComponent(csvData)}`)
                .then(res => {
                    fetchBooks();
                    toast.success(`${res.data.books_created} books imported successfully`);
                    if (res.data.errors.length > 0) {
                        toast.error(`${res.data.errors.length} rows had errors`);
                    }
                })
                .catch(err => {
                    console.error(err);
                    toast.error('Failed to import books');
                });
        };
        reader.readAsText(file);
    };

    return (
        <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-slate-950' : 'bg-gradient-to-br from-indigo-50 via-white to-cyan-50'}`}>
            <div className="max-w-7xl mx-auto px-4 py-12">
                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className={`text-4xl font-bold mb-2 ${isDark ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400' : 'text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-600'}`}>
                            Your Collection
                        </h1>
                        <p className={`text-lg ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            {total} {total === 1 ? 'book' : 'books'} total
                        </p>
                    </div>
                    {localStorage.getItem('is_logged_in') === 'true' && (
                        <Link 
                            to="/create" 
                            className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 shadow-lg ${
                                isDark
                                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 hover:shadow-purple-500/50'
                                    : 'bg-gradient-to-r from-indigo-600 to-pink-500 text-white hover:from-indigo-700 hover:to-pink-600'
                            }`}
                        >
                            + Add Book
                        </Link>
                    )}
                </div>

                {error && (
                    <div className={`rounded-lg p-4 mb-6 border ${isDark ? 'bg-red-900/20 border-red-800 text-red-300' : 'bg-red-50 border-red-100 text-red-700'}`}>
                        {error}
                    </div>
                )}

                {/* Search Bar */}
                <div className={`rounded-2xl p-6 mb-8 backdrop-blur-sm border ${isDark ? 'bg-slate-900/50 border-slate-700' : 'bg-white/80 border-slate-200'}`}>
                    <div className="flex flex-col sm:flex-row gap-4 mb-4">
                        <input
                            type="text"
                            placeholder="Search by book name, author, or publisher..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            className={`flex-1 px-4 py-3 rounded-lg border transition-all ${
                                isDark
                                    ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20'
                                    : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                            }`}
                        />
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                                isDark
                                    ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                        >
                            🔍 {showFilters ? 'Hide' : 'Show'} Filters
                        </button>
                    </div>

                    {/* Filters */}
                    {showFilters && (
                        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                            <input
                                type="text"
                                placeholder="Author"
                                value={authorFilter}
                                onChange={(e) => {
                                    setAuthorFilter(e.target.value);
                                    setPage(1);
                                }}
                                className={`px-3 py-2 rounded-lg border text-sm transition-all ${
                                    isDark
                                        ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500'
                                        : 'bg-white border-slate-200 placeholder-slate-400'
                                }`}
                            />
                            <input
                                type="text"
                                placeholder="Publisher"
                                value={publisherFilter}
                                onChange={(e) => {
                                    setPublisherFilter(e.target.value);
                                    setPage(1);
                                }}
                                className={`px-3 py-2 rounded-lg border text-sm transition-all ${
                                    isDark
                                        ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500'
                                        : 'bg-white border-slate-200 placeholder-slate-400'
                                }`}
                            />
                            <select
                                value={stockFilter}
                                onChange={(e) => {
                                    setStockFilter(e.target.value);
                                    setPage(1);
                                }}
                                className={`px-3 py-2 rounded-lg border text-sm transition-all ${
                                    isDark
                                        ? 'bg-slate-800 border-slate-700 text-white'
                                        : 'bg-white border-slate-200'
                                }`}
                            >
                                <option value="">All Status</option>
                                <option value="available">Available</option>
                                <option value="borrowed">Borrowed</option>
                                <option value="reading">Reading</option>
                            </select>
                            <input
                                type="number"
                                placeholder="Min Price"
                                value={minPrice}
                                onChange={(e) => {
                                    setMinPrice(e.target.value);
                                    setPage(1);
                                }}
                                className={`px-3 py-2 rounded-lg border text-sm transition-all ${
                                    isDark
                                        ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500'
                                        : 'bg-white border-slate-200 placeholder-slate-400'
                                }`}
                            />
                            <input
                                type="number"
                                placeholder="Max Price"
                                value={maxPrice}
                                onChange={(e) => {
                                    setMaxPrice(e.target.value);
                                    setPage(1);
                                }}
                                className={`px-3 py-2 rounded-lg border text-sm transition-all ${
                                    isDark
                                        ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500'
                                        : 'bg-white border-slate-200 placeholder-slate-400'
                                }`}
                            />
                            <input
                                type="date"
                                value={minDate}
                                onChange={(e) => {
                                    setMinDate(e.target.value);
                                    setPage(1);
                                }}
                                className={`px-3 py-2 rounded-lg border text-sm transition-all ${
                                    isDark
                                        ? 'bg-slate-800 border-slate-700 text-white'
                                        : 'bg-white border-slate-200'
                                }`}
                            />
                            <input
                                type="date"
                                value={maxDate}
                                onChange={(e) => {
                                    setMaxDate(e.target.value);
                                    setPage(1);
                                }}
                                className={`px-3 py-2 rounded-lg border text-sm transition-all ${
                                    isDark
                                        ? 'bg-slate-800 border-slate-700 text-white'
                                        : 'bg-white border-slate-200'
                                }`}
                            />
                        </div>
                    )}
                </div>

                {/* Sort & Actions Bar */}
                <div className={`rounded-2xl p-6 mb-8 backdrop-blur-sm border flex flex-wrap items-center justify-between gap-4 ${isDark ? 'bg-slate-900/50 border-slate-700' : 'bg-white/80 border-slate-200'}`}>
                    <div className="flex gap-4">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className={`px-4 py-2 rounded-lg border text-sm font-semibold transition-all ${
                                isDark
                                    ? 'bg-slate-800 border-slate-700 text-white'
                                    : 'bg-white border-slate-200'
                            }`}
                        >
                            <option value="author">Sort by Author</option>
                            <option value="name">Sort by Name</option>
                            <option value="publisher">Sort by Publisher</option>
                            <option value="date">Sort by Date</option>
                            <option value="Cost">Sort by Price</option>
                        </select>
                        <button
                            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                            className={`px-4 py-2 rounded-lg border font-semibold transition-all ${
                                isDark
                                    ? 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700'
                                    : 'bg-white border-slate-200 hover:bg-slate-50'
                            }`}
                        >
                            {sortOrder === 'asc' ? '↑' : '↓'}
                        </button>
                    </div>
                    <div className="flex gap-3">
                        <label className={`px-4 py-2 rounded-lg border font-semibold transition-all cursor-pointer ${
                            isDark
                                ? 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700'
                                : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}>
                            📥 Import CSV
                            <input
                                type="file"
                                accept=".csv"
                                onChange={handleImport}
                                className="hidden"
                            />
                        </label>
                        <button
                            onClick={handleExport}
                            className={`px-4 py-2 rounded-lg border font-semibold transition-all ${
                                isDark
                                    ? 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700'
                                    : 'bg-white border-slate-200 hover:bg-slate-50'
                            }`}
                        >
                            📤 Export CSV
                        </button>
                    </div>
                </div>

                {/* Books Grid */}
                {loading ? (
                    <div className="flex items-center justify-center min-h-80">
                        <div className={`animate-spin rounded-full h-12 w-12 border-4 ${isDark ? 'border-purple-500 border-t-cyan-400' : 'border-indigo-600 border-t-pink-500'}`}></div>
                    </div>
                ) : books.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                            {books.map(book => (
                                <div
                                    key={book.id}
                                    className={`rounded-xl overflow-hidden backdrop-blur-sm border transition-all duration-300 hover:shadow-lg group ${
                                        isDark
                                            ? 'bg-slate-900/50 border-slate-700 hover:border-purple-500/50 hover:shadow-purple-500/20'
                                            : 'bg-white/80 border-slate-200 hover:border-indigo-300 hover:shadow-indigo-200/30'
                                    }`}
                                >
                                    {/* Cover Image */}
                                    <div className="h-40 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                        <span className="text-5xl">📚</span>
                                    </div>

                                    {/* Content */}
                                    <div className="p-4">
                                        <h3 className={`font-bold text-sm mb-1 line-clamp-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                            {book.name}
                                        </h3>
                                        <p className={`text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                            by {book.author}
                                        </p>
                                        <p className={`text-xs mb-3 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                                            {book.publisher}
                                        </p>
                                        <div className="flex justify-between items-center mb-3">
                                            <p className={`font-bold ${isDark ? 'text-cyan-400' : 'text-emerald-600'}`}>
                                                ₹{Number(book.Cost).toFixed(2)}
                                            </p>
                                            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                                {book.date}
                                            </p>
                                        </div>
                                        {localStorage.getItem('is_logged_in') === 'true' && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleUpdate(book)}
                                                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                                                        isDark
                                                            ? 'bg-purple-600/20 text-purple-300 hover:bg-purple-600/30'
                                                            : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                                                    }`}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(book.id)}
                                                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                                                        isDark
                                                            ? 'bg-red-600/20 text-red-300 hover:bg-red-600/30'
                                                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                                                    }`}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        <div className={`rounded-2xl p-6 backdrop-blur-sm border flex items-center justify-between flex-wrap gap-4 ${isDark ? 'bg-slate-900/50 border-slate-700' : 'bg-white/80 border-slate-200'}`}>
                            <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                Page <span className="font-semibold">{page}</span> of <span className="font-semibold">{totalPages}</span> ({total} books)
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPage(Math.max(1, page - 1))}
                                    disabled={page === 1}
                                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                                        page === 1
                                            ? isDark ? 'bg-slate-800 text-slate-600' : 'bg-slate-100 text-slate-400'
                                            : isDark ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-white border border-slate-200 hover:bg-slate-50'
                                    }`}
                                >
                                    ← Previous
                                </button>
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum = i + 1;
                                    if (totalPages > 5 && page > 3) pageNum = page - 2 + i;
                                    if (pageNum > totalPages) return null;
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setPage(pageNum)}
                                            className={`w-10 h-10 rounded-lg font-semibold transition-all ${
                                                page === pageNum
                                                    ? isDark
                                                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                                                        : 'bg-gradient-to-r from-indigo-600 to-pink-500 text-white'
                                                    : isDark ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-white border border-slate-200 hover:bg-slate-50'
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                                <button
                                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                                    disabled={page === totalPages}
                                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                                        page === totalPages
                                            ? isDark ? 'bg-slate-800 text-slate-600' : 'bg-slate-100 text-slate-400'
                                            : isDark ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-white border border-slate-200 hover:bg-slate-50'
                                    }`}
                                >
                                    Next →
                                </button>
                            </div>
                            <select
                                value={pageSize}
                                onChange={(e) => {
                                    setPageSize(Number(e.target.value));
                                    setPage(1);
                                }}
                                className={`px-4 py-2 rounded-lg font-semibold border transition-all ${
                                    isDark
                                        ? 'bg-slate-800 border-slate-700 text-white'
                                        : 'bg-white border-slate-200'
                                }`}
                            >
                                <option value="6">6 per page</option>
                                <option value="12">12 per page</option>
                                <option value="24">24 per page</option>
                                <option value="48">48 per page</option>
                            </select>
                        </div>
                    </>
                ) : (
                    <div className={`rounded-2xl p-12 text-center border-2 border-dashed ${isDark ? 'border-slate-700 bg-slate-900/30' : 'border-slate-200 bg-white/50'}`}>
                        <p className={`text-4xl mb-4`}>📚</p>
                        <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            No books found
                        </h3>
                        <p className={`mb-6 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            Try adjusting your filters or add your first book.
                        </p>
                        {localStorage.getItem('is_logged_in') === 'true' && (
                            <Link
                                to="/create"
                                className={`inline-block px-6 py-3 rounded-full font-semibold transition-all ${
                                    isDark
                                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
                                        : 'bg-gradient-to-r from-indigo-600 to-pink-500 text-white hover:from-indigo-700 hover:to-pink-600'
                                }`}
                            >
                                + Add Your First Book
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Books;
