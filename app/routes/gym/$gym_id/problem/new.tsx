import { Form as RemixForm, useTransition } from '@remix-run/react'
import { Button, Form, Input } from 'antd'
import { ActionFunction, LoaderFunction, redirect } from 'remix'
import { prisma } from '../../../../../lib/prisma'
import { requireUserId } from '../../../../session.server'

let fields = [
  'image_url',
  'color',
  'gym_grade',
  'hold_type',
  'wall_type',
  'style',
] as const

export let loader: LoaderFunction = ({ request }) => requireUserId(request)

export let action: ActionFunction = async ({ params: { gym_id }, request }) => {
  let userId = await requireUserId(request)
  let formData = await request.formData()
  let data = Object.fromEntries(
    fields.map((f) => [f, formData.get(f)])
  ) as Record<typeof fields[number], string>

  await prisma.problem.create({
    data: {
      gym: { connect: { id: gym_id! } },
      created_by: { connect: { id: userId } },
      date: new Date(),
      ...data,
    },
  })

  return redirect(`/gym/${gym_id}`)
}

export default function NewProblem() {
  let { state } = useTransition()

  return (
    <RemixForm method="post">
      <Form component={false} labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}>
        <Form.Item
          label="Image url"
          rules={[{ required: true, message: 'Cmon!' }]}
        >
          <Input name="image_url" />
        </Form.Item>

        <Form.Item label="Color" rules={[{ required: true, message: 'Cmon!' }]}>
          <Input name="color" />
        </Form.Item>

        <Form.Item
          label="Gym grade"
          rules={[{ required: true, message: 'Cmon!' }]}
        >
          <Input name="gym_grade" />
        </Form.Item>

        <Form.Item label="Hold type">
          <Input name="hold_type" />
        </Form.Item>

        <Form.Item label="Wall type">
          <Input name="wall_type" />
        </Form.Item>

        <Form.Item label="Style">
          <Input name="style" />
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 4, span: 16 }}>
          <Button
            type="primary"
            htmlType="submit"
            loading={state === 'submitting' || state === 'loading'}
          >
            Save
          </Button>
        </Form.Item>
      </Form>
    </RemixForm>
  )
}
