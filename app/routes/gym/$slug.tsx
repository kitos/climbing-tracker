import { prisma } from '../../../lib/prisma'
import { Form, useLoaderData } from '@remix-run/react'
import { ActionFunction, LoaderFunction, redirect } from 'remix'

export let loader: LoaderFunction = ({ params }) =>
  prisma.gym.findUnique({
    select: { id: true, name: true },
    where: { id: params.slug },
  })

export let action: ActionFunction = async ({ request }) => {
  if (request.method.toLowerCase() === 'delete') {
    let formData = await request.formData()
    let id = formData.get('id') as string

    await prisma.gym.delete({ where: { id } })

    return redirect('/')
  }
}

export default function GymPage() {
  let gym = useLoaderData<Awaited<ReturnType<typeof loader>>>()

  if (!gym) {
    return <h1>Not found</h1>
  }

  return (
    <div>
      <h1>Gym: {gym.name}</h1>
      <Form method="delete">
        <input type="text" name="id" value={gym.id} readOnly hidden />
        <button type="submit">Delete</button>
      </Form>
    </div>
  )
}
