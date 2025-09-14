import type { AxiosResponse } from 'axios';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { clearToken, setToken } from '../utils/authUtils';

interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  token: string;
}

const Login = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState<string>();
  const [password, setPassword] = useState<string>();

  const login = async (): Promise<LoginResponse> => {
    if (!username || !password) {
      throw new Error('Error...!');
    }
    clearToken();
    const response = await api.post<LoginResponse, AxiosResponse<LoginResponse>, LoginRequest>(
      '/v1/auth/login',
      {
        username: username,
        password: password,
      }
    );
    return response.data;
  };

  const handleLoginSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    login().then((response) => {
      setToken(response.token);
      navigate('/expenses');
    });
  };

  return (
    <div>
      <Card title="Login">
        <form id="loginForm" onSubmit={handleLoginSubmit}>
          <div className="field mb-4">
            <label htmlFor="username" className="block mb-2">
              Username
            </label>
            <InputText
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full"
              autoComplete="username"
            />
          </div>
          <div className="field mb-4">
            <label htmlFor="password" className="block mb-2">
              Password
            </label>
            <Password
              inputId="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              feedback={false}
              className="w-full"
              inputClassName="w-full"
              autoComplete="current-password"
            />
          </div>
          <div className="field mb-4">
            <Button
              label="Login"
              icon="pi pi-sign-in"
              type="submit"
              className="w-full"
              form="loginForm"
            />
          </div>
        </form>
      </Card>
    </div>
  );
};

export default Login;
