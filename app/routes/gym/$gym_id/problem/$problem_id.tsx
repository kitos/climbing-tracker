import { prisma } from '../../../../../lib/prisma'
import { ActionFunction } from 'remix'
import { Form, useLoaderData, useTransition } from '@remix-run/react'
import { Button } from 'antd'
import { DataFunctionArgs } from '@remix-run/server-runtime/routeModules'
import { requireUserId } from '../../../../session.server'

export let loader = async ({ params: { problem_id } }: DataFunctionArgs) => {
  let [likes, problem] = await Promise.all([
    prisma.like.count({ where: { problem_id } }),
    prisma.problem.findUnique({
      where: { id: problem_id },
    }),
  ])

  return { likes, problem }
}

export let action: ActionFunction = async ({ request, params }) => {
  let userId = await requireUserId(request)
  let like = { problem_id: params.problem_id!, user_id: userId }

  let existing = await prisma.like.findUnique({
    where: { problem_id_user_id: like },
  })

  if (existing) {
    await prisma.like.delete({ where: { problem_id_user_id: like } })
  } else {
    await prisma.like.create({ data: like })
  }

  return null
}

export default function ProblemPage() {
  let { likes, problem } = useLoaderData<Awaited<ReturnType<typeof loader>>>()
  let { state } = useTransition()

  if (!problem) {
    return <h1>Not found</h1>
  }

  return (
    <div>
      <h1>{problem.id}</h1>
      <img src={problem.image_url} alt="" />
      <Form method="post">
        <Button
          htmlType="submit"
          disabled={state === 'loading' || state === 'submitting'}
          loading={state === 'submitting'}
        >
          Like ({likes})
        </Button>
      </Form>
    </div>
  )
}
