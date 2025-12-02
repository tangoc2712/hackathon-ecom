import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLoginUserMutation } from '../../redux/api/user.api';
import { userExists } from '../../redux/reducers/user.reducer';
import { AppDispatch } from '../../redux/store';
import { notify } from '../../utils/util';


const LOGIN_SUCCESS = 'Login successful';
const LOGIN_FAILED = 'Login failed';

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [loginUser] = useLoginUserMutation();
    const dispatch = useDispatch<AppDispatch>();

    const handleLogin = async () => {
        if (!email || !password) {
            notify('Email and password are required', 'error');
            return;
        }
        setIsLoading(true);
        try {
            const response = await loginUser({ email, password }).unwrap();
            if (response.user) {
                dispatch(userExists(response.user));
                notify(LOGIN_SUCCESS, 'success');
            } else {
                notify(LOGIN_FAILED, 'error');
            }
        } catch (error: any) {
            const errorMessage = error.data?.message || 'An unknown error occurred';
            notify(errorMessage, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center">
            <div className="w-full max-w-md bg-white rounded-lg p-6 ">
                <h4 className="text-xl font-bold text-center mb-8">Login</h4>
                <div className="mb-4">
                    <label className="block text-sm font-bold mb-2" htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div className="mb-6">
                    <label className="block text-sm font-bold mb-2" htmlFor="password">Password</label>
                    <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <div className="flex items-center mt-2">
                        <input
                            type="checkbox"
                            id="showPassword"
                            checked={showPassword}
                            onChange={() => setShowPassword(!showPassword)}
                            className="mr-2 cursor-pointer"
                        />
                        <label htmlFor="showPassword" className="text-sm text-gray-600">Show Password</label>
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <button
                        className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        type="button"
                        onClick={handleLogin}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Logging in...' : 'Login'}
                    </button>
                </div>



            </div>
        </div>
    );
};

export default LoginPage;
