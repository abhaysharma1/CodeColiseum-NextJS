"use client";

import {
  createContext,
  useContext,
  ReactNode,
} from "react";
import { authClient } from "@/lib/auth-client";
import { BetterFetchError } from "better-auth/react";
import { User } from "@/generated/prisma/client";

interface AuthContexttype {
  user: User | null | undefined;
  loading: boolean;
  refetch: () => void;
  error: BetterFetchError | null;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContexttype | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const {
    data,
    isPending: loading, //loading state
    error,
    refetch,
  } = authClient.useSession();

  const logout = async () => {
    await authClient.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user: data?.user as User,
        loading,
        refetch,
        error,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
