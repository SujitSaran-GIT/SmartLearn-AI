import { createContext, useContext, useState, type ReactNode } from "react";
import type { UpdateProfileData, User } from "../types";


interface UserContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  updateProfile: (data: UpdateProfileData) => void;
  updateProfilePicture: (imageUrl: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>({
    id: '1',
    username: 'John Doe',
    email: 'john@example.com',
    profilePic: undefined
  });

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  const updateProfile = (data: UpdateProfileData) => {
    if (user) {
      setUser({
        ...user,
        username: data.username,
        email: data.email
      });
    }
  };

  const updateProfilePicture = (imageUrl: string) => {
    if (user) {
      setUser({
        ...user,
        profilePic: imageUrl
      });
    }
  };

  return (
    <UserContext.Provider value={{ user, login, logout, updateProfile, updateProfilePicture }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};