import { useNavigate } from 'react-router-dom';
import { signInWithGoogle } from '../firebase/auth';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/health-quest');
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async () => {
    try {
      setError(null);
      setLoading(true);
      await signInWithGoogle();
      // Navigation will happen automatically due to the useEffect above
    } catch (error) {
      console.error('Error logging in:', error);
      setError('Failed to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 text-center">
          <h2 className="mb-4">Welcome to Health Quest</h2>
          {error && (
            <div className="alert alert-danger mb-3" role="alert">
              {error}
            </div>
          )}
          <button 
            className="btn btn-primary"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Signing in...
              </>
            ) : (
              'Sign in with Google'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;