import { prisma } from '../../../../lib/prisma'
import { Form, Link, useLoaderData } from '@remix-run/react'
import { ActionFunction, redirect } from 'remix'
import { DataFunctionArgs } from '@remix-run/server-runtime/routeModules'
import { Avatar, Badge, List, Row, Space, Tag } from 'antd'
import { getUserId, requireUserId } from '../../../session.server'
import { CheckCircleFilled, HeartFilled } from '@ant-design/icons'

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

let cdnRoot = 'https://ik.imagekit.io/kitos'

let trImg = (src: string, size = 100) =>
  src.replace(cdnRoot, `${cdnRoot}/tr:w-${size},h-${size}`)

export default function GymPage() {
  let { canDelete, gym } = useLoaderData<IGym>()

  if (!gym) {
    return null
  }

  return (
    <div>
      <Row justify="space-between">
        <h1>{gym.name}</h1>

        {canDelete && (
          <Form method="delete">
            <button type="submit">❌</button>
          </Form>
        )}
      </Row>

      <List
        dataSource={gym.problems}
        bordered
        renderItem={(p) => (
          <List.Item key={p.id}>
            <List.Item.Meta
              avatar={
                <Avatar shape="square" size={48} src={trImg(p.image_url)} />
              }
              title={
                <Link to={`problem/${p.id}`}>
                  <Space size="small">
                    <span>Grade - {p.gym_grade}</span>
                    <Tag color={p.color}>{p.hold_type ?? 'pinch'}</Tag>
                  </Space>
                </Link>
              }
              description={new Date(p.date).toLocaleDateString()}
            />
            <Space size="middle">
              <Badge size="small" color="green" count={1}>
                <Avatar size={24} shape="square" icon={<CheckCircleFilled />} />
              </Badge>

              <Badge size="small" color="green" count={1}>
                <Avatar size={24} shape="square" icon={<HeartFilled />} />
              </Badge>
            </Space>
          </List.Item>
        )}
      />

      <Link to="problem/new" style={{ display: 'block', marginTop: 16 }}>
        Add new problem
      </Link>
    </div>
  )
}
