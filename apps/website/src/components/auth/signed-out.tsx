import { useAuthentication } from "@/utils/auth/hooks";

export const SignedOut = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthentication();
  if (isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};
