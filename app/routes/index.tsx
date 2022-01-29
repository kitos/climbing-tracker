import { prisma } from '../../lib/prisma'
import { useLoaderData } from '@remix-run/react'

export let loader = () =>
  prisma.gym.findMany({ select: { id: true, name: true } })

export default function Index() {
  let gyms = useLoaderData<Awaited<ReturnType<typeof loader>>>()

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', lineHeight: '1.4' }}>
      <h1>Climbing Tracker</h1>

      <ul>
        {gyms.map((g) => (
          <li key={g.id}>{g.name}</li>
        ))}
      </ul>
    </div>
  )
}
