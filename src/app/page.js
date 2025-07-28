'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChefHat, ShoppingCart, User, LogIn, UserPlus } from 'lucide-react';

export default function Home() {
  const [isLogin, setIsLogin] = useState(true);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');
    const name = formData.get('name');

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const body = isLogin ? { email, password } : { email, password, name };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Redirect based on role
      if (data.user.role === 'admin') {
        router.push('/admin');
      } else if (data.user.role === 'staff') {
        router.push('/staff');
      } else {
        router.push('/menu');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex items-center justify-center mb-3 sm:mb-4">
              <ChefHat className="w-8 h-8 sm:w-12 sm:h-12 text-orange-600" />
              <h1 className="text-2xl sm:text-4xl font-bold text-gray-800 ml-2 sm:ml-3">Homie Kitchen</h1>
            </div>
            <p className="text-gray-600 text-sm sm:text-base">Welcome back, {user.name}!</p>
          </div>

          <div className="max-w-sm sm:max-w-md mx-auto bg-white rounded-lg shadow-lg p-4 sm:p-6">
            <div className="text-center mb-4 sm:mb-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <User className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600" />
              </div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                {user.role === 'admin' ? 'Admin Dashboard' : 'Customer Dashboard'}
              </h2>
              <p className="text-gray-600 text-sm sm:text-base">{user.email}</p>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {user.role === 'admin' ? (
                <button
                  onClick={() => router.push('/admin')}
                  className="w-full bg-orange-600 text-white py-2.5 sm:py-3 px-4 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center text-sm sm:text-base font-medium"
                >
                  <ChefHat className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Manage Restaurant
                </button>
              ) : user.role === 'staff' ? (
                <button
                  onClick={() => router.push('/staff')}
                  className="w-full bg-orange-600 text-white py-2.5 sm:py-3 px-4 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center text-sm sm:text-base font-medium"
                >
                  <ChefHat className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Staff Dashboard
                </button>
              ) : (
                <button
                  onClick={() => router.push('/menu')}
                  className="w-full bg-orange-600 text-white py-2.5 sm:py-3 px-4 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center text-sm sm:text-base font-medium"
                >
                  <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Order Food
                </button>
              )}
              
              <button
                onClick={handleLogout}
                className="w-full bg-gray-200 text-gray-800 py-2.5 sm:py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors text-sm sm:text-base font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center mb-3 sm:mb-4">
            <ChefHat className="w-8 h-8 sm:w-12 sm:h-12 text-orange-600" />
            <h1 className="text-2xl sm:text-4xl font-bold text-gray-800 ml-2 sm:ml-3">Homie Kitchen</h1>
          </div>
          <p className="text-gray-600 text-sm sm:text-base">Delicious food delivered to your doorstep</p>
        </div>

        <div className="max-w-sm sm:max-w-md mx-auto bg-white rounded-lg shadow-lg p-4 sm:p-6">
          <div className="text-center mb-4 sm:mb-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              {isLogin ? (
                <LogIn className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600" />
              ) : (
                <UserPlus className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600" />
              )}
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-gray-600 text-sm sm:text-base">
              {isLogin ? 'Sign in to your account' : 'Join us for delicious food'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-3 sm:space-y-4">
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base"
                  placeholder="Enter your full name"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 text-gray-900 py-2.5 sm:py-3 px-4 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 text-sm sm:text-base font-medium"
            >
              {loading ? 'Loading...' : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div className="mt-4 sm:mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-orange-600 hover:text-orange-700 text-xs sm:text-sm"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>

          <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-800 mb-2 text-sm sm:text-base">Demo Accounts:</h3>
            <div className="text-xs sm:text-sm text-gray-600 space-y-1">
              <p><strong>Admin:</strong> admin@homie.kitchen / admin123</p>
              <p><strong>Customers:</strong></p>
              <p>• john@homie.kitchen / customer123</p>
              <p>• sarah@homie.kitchen / customer123</p>
              <p>• mike@homie.kitchen / customer123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
