// src/services/userService.ts

import axios from "axios";

const API_BASE = "http://localhost:4000/api/user"; // change if using a proxy

// Request payload type
export interface RegisterUserPayload {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
}

// Successful response type
interface RegisterResponse {
  status: string;
  data: {
    user: {
      _id: string;
      fullName: string;
      email: string;
    };
    token?: string; // if you're returning JWT
  };
}

// Error response type (optional)
interface ErrorResponse {
  message: string;
}


// -------- Update Profile Types --------

export interface AddressInput {
  state: string;
  city: string;
  pinCode: string;
}

export interface UpdateProfilePayload {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  password?: string;
  addressId?: string; // If updating address reference
}

export interface UpdateProfileWithAddressPayload {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  password?: string;
  address?: AddressInput; // If sending address fields instead of ID
}

export interface UpdateProfileResponse {
  status: string;
  message: string;
}


// registerUser function
export const registerUser = async (
  payload: RegisterUserPayload
): Promise<RegisterResponse> => {
  try {
    const response = await axios.post<RegisterResponse>(
      `${API_BASE}/signup`,
      payload,
      { withCredentials: true }
    );
    console.log(response.data);
    return response.data;
  } catch (error: any) {
    const err: ErrorResponse = error.response?.data || {
      message: "Unknown error occurred",
    };
    console.log(err);
    throw err;
  }
};


// loginUser function
export const loginUser = async (email: string, password: string) => {
  try {
    const response = await axios.post(
      `${API_BASE}/login`,
      { email, password },
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error: any) {
    const err = error.response?.data || { message: "Login failed" };
    throw err;
  }
};


// logoutUser function

export const logoutUser = async () => {
  try {
    const response = await axios.post(
      `${API_BASE}/logout`,
      {},
      { withCredentials: true }
    );
    return response.data;
  } catch (error: any) {
    const err = error.response?.data || { message: "Logout failed" };
    throw err;
  }
};


// UpdateProfile function

export const updateProfile = async (
  payload: UpdateProfilePayload | UpdateProfileWithAddressPayload
): Promise<{ message: string }> => {
  try {
    const response = await axios.put(
      `${API_BASE}/update-profile`,
      payload,
      { withCredentials: true }
    );
    return response.data.data; 
  } catch (error: any) {
    const err = error.response?.data || { message: "Profile update failed" };
    throw err;
  }
};
