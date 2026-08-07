import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useSignupMutation } from '../features/auth/authApi';
import { setCredentials } from '../features/auth/authSlice';
import { getDashboardPath, getErrorMessage } from '../utils/helpers';

export default function SignupPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [signup, { isLoading }] = useSignupMutation();
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await signup(form).unwrap();
      dispatch(setCredentials(res.data));
      navigate(getDashboardPath(res.data.user.role));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-hero">
        <p className="eyebrow">Attendify</p>
        <h1>Create your employee account</h1>
        <p>Signup creates an employee role. Managers and admins are provisioned by seed/admin.</p>
      </div>

      <form className="auth-card" onSubmit={onSubmit}>
        <h2>Sign up</h2>
        {error && <div className="alert alert-error">{error}</div>}

        <label>
          Full name
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </label>
        <label>
          Email
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </label>
        <label>
          Password
          <input
            type="password"
            minLength={6}
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </label>

        <button type="submit" className="btn btn-primary btn-block" disabled={isLoading}>
          {isLoading ? 'Creating…' : 'Create account'}
        </button>

        <p className="muted center">
          Already registered? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  );
}
