import { LoaderFunction, redirect } from 'remix'
import { Typography } from '@mui/material'
import { finishMagicLogin, getUserId } from '../session.server'

export let loader: LoaderFunction = async ({ request }) => {
  let userId = await getUserId(request)

  if (userId) {
    return redirect('/')
  }

  let jwtToken = new URL(request.url).searchParams.get('_t')

  if (jwtToken) {
    return finishMagicLogin(jwtToken)
  }

  return null
}

export default function MagicPage() {
  return (
    <Typography variant="h6" component="p">
      Check your email sandbox to finish login process.
    </Typography>
  )
}
