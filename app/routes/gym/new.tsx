import { Form, useTransition } from '@remix-run/react'
import { ActionFunction, LoaderFunction, redirect } from 'remix'
import { prisma } from '../../../lib/prisma'
import { requireUserId } from '../../session.server'
import { Button } from 'antd'

export let loader: LoaderFunction = ({ request }) => requireUserId(request)

export let action: ActionFunction = async ({ request }) => {
  let userId = await requireUserId(request)
  let formData = await request.formData()

  await prisma.gym.create({
    data: {
      created_by: { connect: { id: userId } },
      name: formData.get('name') as string,
      address: formData.get('address') as string,
      site: formData.get('site') as string,
    },
  })

  return redirect('/')
}

export default function NewGym() {
  let { state } = useTransition()

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
        <Button
          type="primary"
          htmlType="submit"
          loading={state === 'submitting' || state === 'loading'}
        >
          Create Gym
        </Button>
      </p>
    </Form>
  )
}
