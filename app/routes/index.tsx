import { prisma } from '../../lib/prisma'
import { Link, useLoaderData } from '@remix-run/react'
import { List } from 'antd'

export let loader = () =>
  prisma.gym.findMany({ select: { id: true, name: true, address: true } })

export default function Index() {
  let gyms = useLoaderData<Awaited<ReturnType<typeof loader>>>()

  return (
    <div>
      <List bordered>
        {gyms.map((g) => (
          <List.Item key={g.id}>
            <List.Item.Meta
              title={<Link to={`/gym/${g.id}`}>{g.name}</Link>}
              description={g.address}
            />
          </List.Item>
        ))}
      </List>

      <Link to="/gym/new" style={{ display: 'block', marginTop: 16 }}>
        Add new gym
      </Link>
    </div>
  )
}
