// this file maanages auth/user states
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import {
  signup as signupApi, 
  login as loginApi,
  logout as logoutApi,
  getMe as getMeApi,
  type User,
  type LoginData,
  type SignupData,
} from "../api/authApi";

// context structure
interface AuthContextTypes {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;

    login: (credential : LoginData) => Promise<User>;
    signup: (credential : SignupData) => Promise<User>;
    logout: () => Promise<void>;
}




const AuthContext = createContext<AuthContextTypes | undefined>(undefined);


interface AuthProviderProp {
    children: ReactNode;
}

export const AuthProvider = ({children} : AuthProviderProp) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const isAuthenticated = !!user;

    const login = async (credential : LoginData) : Promise<User> => {
        try {
            setIsLoading(true);

            // call the api
            const response = await loginApi(credential);
            if (response.success && response.data) {
                setUser(response.data)
                return response.data;
            } else {
                throw new Error(response.message || "Logiv failed")
            }
        } catch (error) {
            setUser(null);
            throw error;
        } finally {
            setIsLoading(false)
        }
    };

    const signup = async (userData: SignupData): Promise<User> => {
        try {
            setIsLoading(true);

            const response = await signupApi(userData);
            if (response.success && response.data) {
                setUser(response.data)
                return response.data;
            } else {
                throw new Error(response.message || "Signup failed");
            }
        } catch (error) {
            setUser(null);
            throw error;
        }finally {
            setIsLoading(false)
        }
    }

    const logout = async(): Promise<void> => {
        try{
            setIsLoading(true);
            await logoutApi();
            setUser(null);
        } catch(err) {
            console.log("Logout failed: ", err);
            setUser(null);
        }finally {
            setIsLoading(false)
        }
    }

    // check if user is already logged in 
    // this runs on first mount
  useEffect(() => {
  const checkAuth = async () => {
    try {
      const response = await getMeApi();
      if (response.success && response.data) {
        setUser(response.data);
      }
    } catch {
      // User not authenticated, stay null
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };
  
  checkAuth();
}, []);

    const value: AuthContextTypes = {
     user,
     isLoading,
     isAuthenticated,   
     login,
     signup,
     logout
    };


    // return the provider wrapping children to use in more components later

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )

}


// custom hoook for context consumtion

export const useAuth = ():AuthContextTypes => {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuth must be used within a AuthProvider");
    }

    return context;
}

export default AuthContext;