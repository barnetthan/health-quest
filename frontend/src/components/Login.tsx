import { useNavigate } from 'react-router-dom';
import { signInWithGoogle } from '../firebase/auth';
import { useState } from 'react';

function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    try {
      setError(null);
      await signInWithGoogle();
      navigate('/health-quest');
    } catch (error) {
      console.error('Error logging in:', error);
      setError('Failed to sign in. Please try again.');
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
          >
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;