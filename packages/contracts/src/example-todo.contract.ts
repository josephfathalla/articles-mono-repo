import { oc } from '@orpc/contract'
import * as z from 'zod'

export const TodoSchema = z.object({
  id: z.number().int().min(1),
  text: z.string(),
  completed: z.boolean(),
})

export const listTodoContract = oc
  .route({
    method: 'GET',
    path: '/todos' // Path is required for NestJS implementation
  })
  .output(z.array(TodoSchema))
