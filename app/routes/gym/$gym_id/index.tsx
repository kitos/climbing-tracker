import { prisma } from '../../../../lib/prisma'
import { Form, Link, useLoaderData } from '@remix-run/react'
import { ActionFunction, redirect } from 'remix'
import { DataFunctionArgs } from '@remix-run/server-runtime/routeModules'
import { Table } from 'antd'
import { Column } from 'rc-table'
import { getUserId, requireUserId } from '../../../session.server'

export let loader = async ({ request, params }: DataFunctionArgs) => {
  let [userId, gym] = await Promise.all([
    getUserId(request),
    prisma.gym.findUnique({
      select: { id: true, name: true, problems: true, created_by_id: true },
      where: { id: params.gym_id },
    }),
  ])

  return { canDelete: userId === gym?.created_by_id, gym }
}

export let action: ActionFunction = async ({ request, params }) => {
  if (request.method.toLowerCase() === 'delete') {
    let userId = await requireUserId(request)
    let byId = { where: { id: params.gym_id } }
    let gym = await prisma.gym.findUnique({
      select: { created_by_id: true },
      ...byId,
    })

    if (gym && userId === gym.created_by_id) {
      await prisma.gym.delete(byId)
      return redirect('/')
    } else {
      return null
    }
  }
}

type IGym = Awaited<ReturnType<typeof loader>>

export default function GymPage() {
  let { canDelete, gym } = useLoaderData<IGym>()

  if (!gym) {
    return <h1>Not found</h1>
  }

  return (
    <div>
      <Link to="/">Home</Link>
      <h1>Gym: {gym.name}</h1>

      <h2>Problems</h2>

      <Table dataSource={gym.problems}>
        <Column
          title="Date"
          dataIndex="date"
          key="date"
          render={(v, p: any) => <Link to={`problem/${p.id}`}>{v}</Link>}
        />
        <Column title="Color" dataIndex="color" key="color" />
      </Table>

      <Link to="problem/new">Add new problem</Link>

      {canDelete && (
        <Form method="delete">
          <button type="submit">Delete</button>
        </Form>
      )}
    </div>
  )
}
