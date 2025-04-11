import { useNavigate } from 'react-router-dom';
import { signInWithGoogle } from '../firebase/auth';

function Login() {
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
      navigate('/health-quest');
    } catch (error) {
      console.error('Error logging in:', error);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 text-center">
          <h2 className="mb-4">Welcome to Health Quest</h2>
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