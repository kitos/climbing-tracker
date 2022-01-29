import { Form as RemixForm } from '@remix-run/react'
import { Button, Form, Input } from 'antd'
import { ActionFunction, redirect } from 'remix'
import { prisma } from '../../../../../lib/prisma'

let fields = [
  'image_url',
  'color',
  'gym_grade',
  'hold_type',
  'wall_type',
  'style',
] as const

export let action: ActionFunction = async ({ params: { gym_id }, request }) => {
  let formData = await request.formData()
  let data = Object.fromEntries(
    fields.map((f) => [f, formData.get(f)])
  ) as Record<typeof fields[number], string>

  await prisma.problem.create({
    data: {
      gym: { connect: { id: gym_id! } },
      date: new Date(),
      ...data,
    },
  })

  return redirect(`/gym/${gym_id}`)
}

export default function NewProblem() {
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
          <Button type="primary" htmlType="submit">
            Save
          </Button>
        </Form.Item>
      </Form>
    </RemixForm>
  )
}
