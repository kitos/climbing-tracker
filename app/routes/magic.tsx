import { LoaderFunction, redirect } from 'remix'
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
  return <div>Check your email sandbox to finish login process.</div>
}
