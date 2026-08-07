import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser, selectToken } from '../features/auth/authSlice';
import { getDashboardPath } from '../utils/helpers';

export default function HomeRedirect() {
  const user = useSelector(selectCurrentUser);
  const token = useSelector(selectToken);

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={getDashboardPath(user.role)} replace />;
}
