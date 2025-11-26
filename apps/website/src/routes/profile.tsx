import { createFileRoute } from "@tanstack/react-router";
import { authClient } from "@/utils/auth-client";

export const Route = createFileRoute("/profile")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: session } = authClient.useSession();

  return (
    <div>
      <h1>Profile</h1>
      <p>{session?.user.name}</p>

      <div>
        {session ? (
          <div>
            <p>Email: {session.user.email}</p>
            <button onClick={() => authClient.signOut()}>Sign out</button>
          </div>
        ) : (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const email = formData.get("email") as string;
              const password = formData.get("password") as string;
              await authClient.signIn.email({ email, password });
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
        )}
      </div>
    </div>
  );
}
