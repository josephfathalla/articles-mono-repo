import { useQuery } from "@tanstack/react-query";
import { authQueries } from "@/services/queries";

export const useAuthentication = () => {
  const { data: userSession } = useQuery(authQueries.user());
  return { userSession, isAuthenticated: !!userSession?.user };
};

export const useAuthenticatedUser = () => {
  const { userSession } = useAuthentication();

  if (!userSession) {
    throw new Error("User is not authenticated!");
  }

  return userSession;
};
