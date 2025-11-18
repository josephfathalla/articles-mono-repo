import { oc } from "@orpc/contract";
import * as z from "zod";

export const TodoSchema = z.object({
  id: z.number().int().min(1),
  text: z.string(),
  completed: z.boolean(),
});

export const listTodoContract = oc
  .route({
    method: "GET",
    path:"/"
  })
  .output(z.array(TodoSchema));

export const createTodoContract = oc
  .route({
    method: "POST",
    path:"/"
  })
  .input(TodoSchema.pick({ text: true }))
  .output(TodoSchema);

export const toggleTodoContract = oc
  .route({
    method: "PUT",
    path:"/"
  })
  .input(TodoSchema.pick({ id: true, completed: true }))
  .output(TodoSchema);

export const deleteTodoContract = oc
  .route({
    method: "DELETE",
    path:"/"
  })
  .input(TodoSchema.pick({ id: true }))
  .output(TodoSchema);


export const todo = oc.prefix("/todos").router({
  list: listTodoContract,
  create: createTodoContract,
  toggle: toggleTodoContract,
  delete: deleteTodoContract,
});
