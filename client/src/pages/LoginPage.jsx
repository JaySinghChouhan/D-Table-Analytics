import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useLoginMutation } from '../features/auth/authApi';
import { setCredentials } from '../features/auth/authSlice';
import { getDashboardPath, getErrorMessage } from '../utils/helpers';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [login, { isLoading }] = useLoginMutation();
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await login(form).unwrap();
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
        <h1>Attendance with live verification</h1>
        <p>
          Punch in with location and selfie checks. Managers validate authenticity and approve
          overtime in one workflow.
        </p>
      </div>

      <form className="auth-card" onSubmit={onSubmit}>
        <h2>Sign in</h2>
        <p className="muted">Use your work email to continue.</p>

        {error && <div className="alert alert-error">{error}</div>}

        <label>
          Email
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="alice@attendance.com"
          />
        </label>

        <label>
          Password
          <input
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="••••••••"
          />
        </label>

        <button type="submit" className="btn btn-primary btn-block" disabled={isLoading}>
          {isLoading ? 'Signing in…' : 'Sign in'}
        </button>

        <p className="muted center">
          New here? <Link to="/signup">Create an employee account</Link>
        </p>
      </form>
    </div>
  );
}
