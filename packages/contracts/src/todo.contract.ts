import { oc } from "@orpc/contract";
import { z } from "zod";

export const TodoSchema = z.object({
  id: z.number().int().min(1),
  text: z.string(),
  completed: z.boolean(),
});

export const listTodoContract = oc
  .route({
    method: "GET",
    path: "/",
    tags: ["todos"],
    summary: "List all todos",
    description: "Retrieves all todo items from the system",
  })
  .output(z.array(TodoSchema));

export const createTodoContract = oc
  .route({
    method: "POST",
    path: "/",
    tags: ["todos"],
    summary: "Create a new todo",
    description:
      "Creates a new todo item with the provided text. The todo will be initialized as incomplete.",
  })
  .input(TodoSchema.pick({ text: true }))
  .output(TodoSchema);

export const toggleTodoContract = oc
  .route({
    method: "PUT",
    path: "/",
    tags: ["todos"],
    summary: "Update todo completion status",
    description:
      "Updates the completion status of a todo item by its ID. Use this to mark a todo as completed or incomplete.",
  })
  .input(TodoSchema.pick({ id: true, completed: true }))
  .output(TodoSchema);

export const deleteTodoContract = oc
  .route({
    method: "DELETE",
    path: "/",
    tags: ["todos"],
    summary: "Delete a todo",
    description:
      "Deletes a todo item by its ID. Returns the deleted todo item.",
  })
  .input(TodoSchema.pick({ id: true }))
  .output(TodoSchema);

export const todo = oc.prefix("/todos").router({
  list: listTodoContract,
  create: createTodoContract,
  toggle: toggleTodoContract,
  delete: deleteTodoContract,
});
