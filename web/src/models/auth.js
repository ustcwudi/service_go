import { useState, useCallback } from 'react';

export default () => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const login = useCallback((info, role) => {
    setUser(info);
    setRole(role);
  }, []);
  const logout = useCallback(() => {
    setUser(null);
    setRole(null);
  }, []);
  return {
    user,
    role,
    login,
    logout,
  };
};
