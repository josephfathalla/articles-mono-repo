import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/demo/todos")({
  component: RouteComponent,
  // loader: ({ context }) => {
  //   context.queryClient.ensureQueryData(
  //     orpc.todo.list.queryOptions({
  //       input: {
  //         page: "1",
  //         limit: "10",
  //         select: "all",
  //         sort: { field: "text", criteria: "asc" },
  //       },
  //     })
  //   );
  // },
});

function RouteComponent() {
  const { data } = useQuery(
    orpc.todo.list.queryOptions({
      input: {
        page: "1",
        limit: "10",
        select: "all",
        sort: { field: "text", criteria: "asc" },
      },
    })
  );

  return (
    <div>
      <h1>Todos {import.meta.env.VITE_SERVER_URL ?? "No URL"}</h1>
      <ul>
        {data?.data?.map((todo) => (
          <li key={todo.id}>{todo.text}</li>
        ))}
      </ul>
    </div>
  );
}
