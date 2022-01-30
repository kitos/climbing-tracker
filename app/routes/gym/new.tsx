import { Form } from '@remix-run/react'
import { ActionFunction, redirect } from 'remix'
import { prisma } from '../../../lib/prisma'
import { DataFunctionArgs } from '@remix-run/server-runtime/routeModules'
import { requireUserId } from '../../session.server'

export let loader = ({ request }: DataFunctionArgs) => requireUserId(request)

export let action: ActionFunction = async ({ request }) => {
  let formData = await request.formData()

  let data = {
    name: formData.get('name') as string,
    address: formData.get('address') as string,
    site: formData.get('site') as string,
  }

  await prisma.gym.create({ data })

  return redirect('/')
}

export default function NewGym() {
  return (
    <Form method="post">
      <p>
        <label>
          Name: <input type="text" name="name" />
        </label>
      </p>
      <p>
        <label>
          Address: <input type="text" name="address" />
        </label>
      </p>
      <p>
        <label>
          Site: <input type="text" name="site" />
        </label>
      </p>
      <p>
        <button type="submit">Create Gym</button>
      </p>
    </Form>
  )
}
