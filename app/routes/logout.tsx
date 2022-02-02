import { LoaderFunction } from 'remix'
import { logout } from '../session.server'

export let loader: LoaderFunction = ({ request }) => logout(request)

export default function LogoutPage() {
  return null
}
