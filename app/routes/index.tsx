import { prisma } from '../../lib/prisma'
import { Link, useLoaderData } from '@remix-run/react'

export let loader = () =>
  prisma.gym.findMany({ select: { id: true, name: true } })

export default function Index() {
  let gyms = useLoaderData<Awaited<ReturnType<typeof loader>>>()

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', lineHeight: '1.4' }}>
      <h1>Climbing Tracker</h1>

      <Link to="/gym/new">Add new gym</Link>

      <ul>
        {gyms.map((g) => (
          <li key={g.id}>
            <Link to={`/gym/${g.id}`}>{g.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
