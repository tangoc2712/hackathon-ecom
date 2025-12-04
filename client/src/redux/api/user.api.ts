import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { AllUserResponse, UserLoginRequest, UserLoginResponse, UserRegisterRequest, UserResponse } from '../../types/api-types';

export const userApi = createApi({
    reducerPath: 'userAPI',
    baseQuery: fetchBaseQuery({
        baseUrl: '/api/v1/auth/',
        credentials: 'include',
    }),
    tagTypes: ['User'],
    endpoints: (builder) => ({
        getAllUsers: builder.query<AllUserResponse, string>({
            query: () => 'all',
        }),
        getUser: builder.query({
            query: (id: string) => `${id}`,
        }),
        loginUser: builder.mutation<UserLoginResponse, UserLoginRequest>({
            query: ({ email, password }) => ({
                url: 'login',
                method: 'POST',
                body: { email, password },
            }),
        }),
        signupUser: builder.mutation<UserLoginResponse, UserRegisterRequest>({
            query: ({ email, password, name, gender, dob }) => ({
                url: 'signup',
                method: 'POST',
                body: { email, password, name, gender, dob },
            }),
        }),
        getMe: builder.query<UserResponse, void>({
            query: () => ({
                url: 'me',
                method: 'GET',
            }),
            // Retry on network error or 5xx errors (not 401 Unauthorized)
            extraOptions: {
                maxRetries: 2,
            }
        }),
        logoutUser: builder.mutation<void, void>({
            query: () => ({
                url: 'logout',
                method: 'POST',
            })
        }),
    }),
});

export const {
    useGetAllUsersQuery,
    useGetUserQuery,
    useLoginUserMutation,
    useSignupUserMutation,
    useGetMeQuery,
    useLogoutUserMutation,
} = userApi;
