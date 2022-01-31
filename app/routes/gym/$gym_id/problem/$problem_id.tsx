import { prisma } from '../../../../../lib/prisma'
import { ActionFunction, redirect } from 'remix'
import { Form, useLoaderData, useTransition } from '@remix-run/react'
import { LoadingButton } from '@mui/lab'
import { DeleteOutlined, ThumbUpOutlined } from '@mui/icons-material'
import { DataFunctionArgs } from '@remix-run/server-runtime/routeModules'
import { requireUserId } from '../../../../session.server'
import { Stack } from '@mui/material'

export let loader = async ({ params: { problem_id } }: DataFunctionArgs) => {
  let [likes, problem] = await Promise.all([
    prisma.like.count({ where: { problem_id } }),
    prisma.problem.findUnique({
      where: { id: problem_id },
    }),
  ])

  return { likes, problem }
}

export let action: ActionFunction = async ({
  request,
  params: { gym_id, problem_id },
}) => {
  let userId = await requireUserId(request)
  let formData = await request.formData()

  switch (formData.get('_action')) {
    case 'like': {
      let like = { problem_id: problem_id!, user_id: userId }

      let existing = await prisma.like.findUnique({
        where: { problem_id_user_id: like },
      })

      if (existing) {
        await prisma.like.delete({ where: { problem_id_user_id: like } })
      } else {
        await prisma.like.create({ data: like })
      }
      break
    }
    case 'delete': {
      await prisma.problem.delete({ where: { id: problem_id } })
      return redirect(`/gym/${gym_id}`)
    }
  }

  return null
}

export default function ProblemPage() {
  let { likes, problem } = useLoaderData<Awaited<ReturnType<typeof loader>>>()
  let { state, submission } = useTransition()
  let _action = submission?.formData.get('_action')

  if (!problem) {
    return <h1>Not found</h1>
  }

  return (
    <Stack spacing={2}>
      <h1>{problem.id}</h1>
      <img src={problem.image_url} alt="" />
      <Form method="post" replace>
        <Stack direction="row" spacing={2}>
          <LoadingButton
            variant="outlined"
            startIcon={<ThumbUpOutlined />}
            loading={state === 'submitting' && _action === 'like'}
            loadingPosition="start"
            type="submit"
            name="_action"
            value="like"
          >
            Like ({likes})
          </LoadingButton>

          <LoadingButton
            variant="contained"
            color="error"
            startIcon={<DeleteOutlined />}
            loading={state === 'submitting' && _action === 'delete'}
            loadingPosition="start"
            type="submit"
            name="_action"
            value="delete"
          >
            Delete
          </LoadingButton>
        </Stack>
      </Form>
    </Stack>
  )
}
