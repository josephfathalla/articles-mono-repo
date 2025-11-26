import { useAuthentication } from "@/utils/auth/hooks";

export const SignedIn = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthentication();

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};
