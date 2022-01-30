import {
  ActionFunction,
  LoaderFunction,
  redirect,
  useSearchParams,
} from 'remix'
import { Form as RemixForm } from '@remix-run/react'
import { Button, Form, Input } from 'antd'
import { getUserId, initMagicLogin } from '../session.server'

export let loader: LoaderFunction = async ({ request }) => {
  let userId = await getUserId(request)

  return userId ? redirect('/') : null
}

export let action: ActionFunction = async ({ request }) => {
  let formData = await request.formData()

  return initMagicLogin(
    formData.get('email') as string,
    formData.get('redirectTo') as string
  )
}

export default function LoginPage() {
  let [searchParams] = useSearchParams()

  return (
    <RemixForm method="post">
      <input
        type="hidden"
        name="redirectTo"
        value={searchParams.get('redirectTo') ?? void 0}
      />
      <Form component={false} labelCol={{ span: 4 }} wrapperCol={{ span: 8 }}>
        <Form.Item label="Email" rules={[{ required: true, message: 'Cmon!' }]}>
          <Input name="email" />
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 4, span: 16 }}>
          <Button type="primary" htmlType="submit">
            Login
          </Button>
        </Form.Item>
      </Form>
    </RemixForm>
  )
}
