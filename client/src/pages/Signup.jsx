import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await register(name, email, password);

    if (result.success) {
      // Small delay to ensure state is updated
      setTimeout(() => {
        navigate('/chat', { replace: true });
      }, 100);
    } else {
      setError(result.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-whatsapp-dark to-whatsapp-darker p-4">
      <div className="bg-white p-6 md:p-8 rounded-lg shadow-2xl w-full max-w-md">
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-whatsapp-dark mb-2">
            Create Account
          </h1>
          <p className="text-sm md:text-base text-gray-600">Join Chating Buddy</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-3 md:px-4 py-2 md:py-3 rounded mb-4 text-sm md:text-base">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
              className="w-full px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-whatsapp-green focus:border-transparent outline-none"
              placeholder="Enter your name"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-whatsapp-green focus:border-transparent outline-none"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-whatsapp-green focus:border-transparent outline-none"
              placeholder="Enter your password (min 6 characters)"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-whatsapp-green hover:bg-whatsapp-dark text-white font-semibold py-2.5 md:py-3 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-4 md:mt-6 text-center text-sm md:text-base text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-whatsapp-green hover:text-whatsapp-dark font-semibold">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;

