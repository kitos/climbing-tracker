import {
  ActionFunction,
  LoaderFunction,
  redirect,
  useSearchParams,
} from 'remix'
import { Form, useTransition } from '@remix-run/react'
import { Stack, TextField } from '@mui/material'
import { LoadingButton } from '@mui/lab'
import { getUserId, initMagicLogin } from '~/session.server'

export let loader: LoaderFunction = async ({ request }) => {
  let userId = await getUserId(request)

  return userId ? redirect('/') : null
}

export let action: ActionFunction = async ({ request }) => {
  let { email, redirectTo } = Object.fromEntries(await request.formData())

  return initMagicLogin(email as string, redirectTo as string)
}

export default function LoginPage() {
  let [searchParams] = useSearchParams()
  let { state } = useTransition()

  return (
    <Stack component={Form} method="post" spacing={2}>
      <input
        type="hidden"
        name="redirectTo"
        value={searchParams.get('redirectTo') ?? void 0}
      />
      <TextField label="Email" name="email" type="email" required />

      <LoadingButton
        type="submit"
        variant="contained"
        loading={state === 'submitting'}
      >
        Login
      </LoadingButton>
    </Stack>
  )
}
