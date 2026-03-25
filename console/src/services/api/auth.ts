import { api } from './client'
import type { Workspace } from './workspace'

// Authentication types
export interface SignInRequest {
  email: string,
  password: string
}
export interface SignInResponse {
  message: string
  code?: string,
  token: string
}
export interface SignUpRequest {
  email: string,
  password: string,
  confirm_password: string
}
export interface SignUpResponse {
  message: string
  code?: string
  token?: string
}
export interface VerifyCodeRequest {
  email: string
  code: string
}

export interface VerifyResponse {
  token: string
}

export interface GetCurrentUserResponse {
  user: {
    id: string
    email: string
    timezone: string
  }
  workspaces: Workspace[]
}

/**
 * Check if the current user is the root user
 */
export function isRootUser(userEmail?: string): boolean {
  if (!userEmail || !window.ROOT_EMAIL) {
    return false
  }
  return userEmail === window.ROOT_EMAIL
}

export interface LogoutResponse {
  message: string
}

export interface ActivateUserRequest{
  code: string
}

export interface ActivateUserResponse{
  message: string,
  status: boolean
  workspaceId: string
}

export interface AppleLoginResponse {
  message: string,
  code?: string,
  redirectUrl?: string
}

export interface RestorePasswordRequest {
  email: string
}

export interface RestorePasswordResponse {
  message: string
}

export interface SetNewPasswordRequest {
  code: string
  newPassword: string
  confirmPassword: string
}

export interface SetNewPasswordResponse {
  message: string
}

export const authService = {
  signIn: (data: SignInRequest) => api.post<SignInResponse>('/api/user.signin', data),
  signUp: (data: SignUpRequest) => api.post<SignUpResponse>('/api/user.signup', data),
  appleLogin: () => api.post<AppleLoginResponse>('/api/user.apple.login', {}),
  activateUser: (data: ActivateUserRequest) => api.post<ActivateUserResponse>('/api/user.activate', data),
  verifyCode: (data: VerifyCodeRequest) => api.post<VerifyResponse>('/api/user.verify', data),
  getCurrentUser: () => api.get<GetCurrentUserResponse>('/api/user.me'),
  logout: () => api.post<LogoutResponse>('/api/user.logout', {}),
  restorePassword: (data: RestorePasswordRequest) => api.post<RestorePasswordResponse>('/api/user.restore', data),
  setNewPassword: (data: SetNewPasswordRequest) => api.post<SetNewPasswordResponse>('/api/user.restore.password', data)
}
