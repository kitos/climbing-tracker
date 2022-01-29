import { prisma } from '../../../../lib/prisma'
import { Form, Link, useLoaderData } from '@remix-run/react'
import { ActionFunction, redirect } from 'remix'
import { DataFunctionArgs } from '@remix-run/server-runtime/routeModules'
import { Table } from 'antd'
import { Column } from 'rc-table'

export let loader = async ({ params }: DataFunctionArgs) =>
  prisma.gym.findUnique({
    select: { id: true, name: true, problems: true },
    where: { id: params.gym_id },
  })

export let action: ActionFunction = async ({ request, params }) => {
  if (request.method.toLowerCase() === 'delete') {
    await prisma.gym.delete({ where: { id: params.gym_id } })

    return redirect('/')
  }
}

type IGym = Awaited<ReturnType<typeof loader>>

export default function GymPage() {
  let gym = useLoaderData<IGym>()

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

      <Form method="delete">
        <button type="submit">Delete</button>
      </Form>
    </div>
  )
}
