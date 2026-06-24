import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useTheme } from './ThemeContext';

const Profile = () => {
    const { isDark } = useTheme();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const username = localStorage.getItem('username') || 'User';
    const email = localStorage.getItem('email') || '';

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_URL}/stats`)
            .then(res => {
                setStats(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setError('Failed to load statistics');
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className={`flex items-center justify-center min-h-screen ${isDark ? 'bg-slate-950' : 'bg-gradient-to-br from-indigo-50 via-white to-cyan-50'}`}>
                <div className="text-center">
                    <div className={`animate-spin rounded-full h-12 w-12 border-4 ${isDark ? 'border-purple-500 border-t-cyan-400' : 'border-indigo-600 border-t-pink-500'}`}></div>
                    <p className={`mt-4 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Loading your profile...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`max-w-4xl mx-auto px-4 py-8`}>
                <div className={`rounded-lg p-4 ${isDark ? 'bg-red-900/20 border border-red-800 text-red-300' : 'bg-red-50 border border-red-100 text-red-700'}`}>
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-slate-950' : 'bg-gradient-to-br from-indigo-50 via-white to-cyan-50'}`}>
            <div className="max-w-5xl mx-auto px-4 py-12">
                {/* Header */}
                <div className={`mb-12 ${isDark ? 'text-white' : ''}`}>
                    <div className="flex items-center gap-4 mb-4">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${
                            isDark
                                ? 'bg-gradient-to-br from-purple-600 to-pink-600'
                                : 'bg-gradient-to-br from-indigo-600 to-pink-500'
                        }`}>
                            {username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h1 className={`text-3xl font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                {username}
                            </h1>
                            {email && (
                                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                    {email}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {/* Total Books */}
                    <div className={`rounded-2xl p-6 backdrop-blur-sm transition-all duration-300 hover:shadow-lg ${
                        isDark
                            ? 'bg-gradient-to-br from-purple-900/40 to-purple-800/20 border border-purple-500/30 hover:shadow-purple-500/20'
                            : 'bg-gradient-to-br from-indigo-50 to-indigo-100/50 border border-indigo-200 hover:shadow-indigo-200'
                    }`}>
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-3xl">📚</span>
                            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${isDark ? 'bg-purple-500/20 text-purple-300' : 'bg-indigo-200 text-indigo-700'}`}>
                                Total
                            </div>
                        </div>
                        <p className={`text-3xl font-bold mb-1 ${isDark ? 'text-white' : 'text-indigo-900'}`}>
                            {stats?.total_books || 0}
                        </p>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Books in collection</p>
                    </div>

                    {/* Total Cost */}
                    <div className={`rounded-2xl p-6 backdrop-blur-sm transition-all duration-300 hover:shadow-lg ${
                        isDark
                            ? 'bg-gradient-to-br from-cyan-900/40 to-cyan-800/20 border border-cyan-500/30 hover:shadow-cyan-500/20'
                            : 'bg-gradient-to-br from-cyan-50 to-cyan-100/50 border border-cyan-200 hover:shadow-cyan-200'
                    }`}>
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-3xl">💰</span>
                            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${isDark ? 'bg-cyan-500/20 text-cyan-300' : 'bg-cyan-200 text-cyan-700'}`}>
                                Investment
                            </div>
                        </div>
                        <p className={`text-3xl font-bold mb-1 ${isDark ? 'text-white' : 'text-cyan-900'}`}>
                            ₹{(stats?.total_cost || 0).toFixed(2)}
                        </p>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Total spent</p>
                    </div>

                    {/* Most Expensive */}
                    <div className={`rounded-2xl p-6 backdrop-blur-sm transition-all duration-300 hover:shadow-lg ${
                        isDark
                            ? 'bg-gradient-to-br from-pink-900/40 to-pink-800/20 border border-pink-500/30 hover:shadow-pink-500/20'
                            : 'bg-gradient-to-br from-pink-50 to-pink-100/50 border border-pink-200 hover:shadow-pink-200'
                    }`}>
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-3xl">👑</span>
                            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${isDark ? 'bg-pink-500/20 text-pink-300' : 'bg-pink-200 text-pink-700'}`}>
                                Premium
                            </div>
                        </div>
                        <p className={`text-3xl font-bold mb-1 ${isDark ? 'text-white' : 'text-pink-900'}`}>
                            ₹{(stats?.most_expensive?.Cost || 0).toFixed(2)}
                        </p>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Most expensive</p>
                    </div>

                    {/* Average Rating */}
                    <div className={`rounded-2xl p-6 backdrop-blur-sm transition-all duration-300 hover:shadow-lg ${
                        isDark
                            ? 'bg-gradient-to-br from-emerald-900/40 to-emerald-800/20 border border-emerald-500/30 hover:shadow-emerald-500/20'
                            : 'bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200 hover:shadow-emerald-200'
                    }`}>
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-3xl">⭐</span>
                            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${isDark ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-200 text-emerald-700'}`}>
                                Rating
                            </div>
                        </div>
                        <p className={`text-3xl font-bold mb-1 ${isDark ? 'text-white' : 'text-emerald-900'}`}>
                            {stats?.average_rating || 0}
                        </p>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Average rating</p>
                    </div>
                </div>

                {/* Most Expensive Book Card */}
                {stats?.most_expensive && (
                    <div className={`rounded-2xl p-8 backdrop-blur-sm border ${
                        isDark
                            ? 'bg-slate-900/50 border-slate-700 shadow-xl shadow-purple-500/10'
                            : 'bg-white/80 border-slate-200 shadow-xl shadow-indigo-200/20'
                    }`}>
                        <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            Your Most Expensive Book
                        </h2>
                        <div className="flex gap-6">
                            {stats.most_expensive.cover_url && (
                                <img 
                                    src={stats.most_expensive.cover_url}
                                    alt={stats.most_expensive.name}
                                    className="w-24 h-32 rounded-lg object-cover shadow-lg"
                                    onError={(e) => e.target.style.display = 'none'}
                                />
                            )}
                            <div className="flex-1">
                                <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                    {stats.most_expensive.name}
                                </h3>
                                <p className={`mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                    <span className="font-semibold">Author:</span> {stats.most_expensive.author}
                                </p>
                                <p className={`mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                    <span className="font-semibold">Publisher:</span> {stats.most_expensive.publisher}
                                </p>
                                <p className={`text-2xl font-bold ${isDark ? 'text-cyan-400' : 'text-emerald-600'}`}>
                                    ₹{stats.most_expensive.Cost.toFixed(2)}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;
