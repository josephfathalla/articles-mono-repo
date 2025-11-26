import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { SignedIn } from "@/components/auth/signed-in";
import { SignedOut } from "@/components/auth/signed-out";
import { authClient } from "@/utils/auth/auth-client";

export const Route = createFileRoute("/profile")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: session } = authClient.useSession();
  const queryClient = useQueryClient();

  return (
    <div>
      <SignedIn>
        <h1>Profile</h1>
        <p>{session?.user.name}</p>
        <div>
          <p>Email: {session?.user.email}</p>
          <button
            onClick={async () => {
              await authClient.signOut();
              await queryClient.resetQueries();
            }}
            type="button"
          >
            Sign out
          </button>
        </div>
      </SignedIn>

      <SignedOut>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const email = formData.get("email") as string;
            const password = formData.get("password") as string;
            await authClient.signIn.email({ email, password });
            await queryClient.resetQueries();
          }}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            maxWidth: 320,
          }}
        >
          <label>
            Email:
            <input name="email" required type="email" />
          </label>
          <label>
            Password:
            <input name="password" required type="password" />
          </label>
          <button type="submit">Login</button>
        </form>
      </SignedOut>
    </div>
  );
}
