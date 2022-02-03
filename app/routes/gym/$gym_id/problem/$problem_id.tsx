import { useState } from 'react'
import { ActionFunction, redirect } from 'remix'
import { Form, useLoaderData, useTransition } from '@remix-run/react'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
} from '@mui/material'
import { LoadingButton } from '@mui/lab'
import { Check, DeleteOutlined, ThumbUpOutlined } from '@mui/icons-material'
import { DataFunctionArgs } from '@remix-run/server-runtime/routeModules'
import { getUserId, requireUserId } from '~/session.server'
import { trImg } from '~/image'
import { prisma } from '~/prisma'
import { SendProblemForm } from '~/components/SendProblemForm'

export let loader = async ({ request, params }: DataFunctionArgs) => {
  let problem_id = params.problem_id!
  let user_id = await getUserId(request)

  let [problem, send] = await Promise.all([
    prisma.problem.findUnique({
      include: {
        likes: { select: { user_id: true } },
        sends: { select: { user_id: true } },
      },
      where: { id: problem_id },
    }),
    user_id
      ? prisma.send.findUnique({
          where: { problem_id_user_id: { problem_id, user_id } },
        })
      : null,
  ])

  return { problem, userId: user_id, send }
}

export let action: ActionFunction = async ({ request, params }) => {
  let problem_id = params.problem_id!
  let user_id = await requireUserId(request)
  let formData = await request.formData()

  switch (formData.get('_action')) {
    case 'like': {
      let like = { problem_id, user_id }

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
      let byId = { where: { id: problem_id } }
      let problem = await prisma.problem.findUnique({
        select: { created_by_id: true },
        ...byId,
      })

      if (problem?.created_by_id === user_id) {
        await prisma.problem.delete(byId)
        return redirect(`/gym/${params.gym_id}`)
      }
      break
    }
    case 'send': {
      let { attempts, grade, date } = Object.fromEntries(formData) as Record<
        string,
        string
      >
      let data = {
        date: new Date(date).toISOString(),
        grade: parseInt(grade),
        attempts,
      }

      await prisma.send.upsert({
        create: {
          problem: { connect: { id: problem_id } },
          sender: { connect: { id: user_id } },
          ...data,
        },
        update: data,
        where: { problem_id_user_id: { problem_id, user_id } },
      })
    }
  }

  return null
}

export default function ProblemPage() {
  let { problem, userId, send } =
    useLoaderData<Awaited<ReturnType<typeof loader>>>()
  let { state, submission } = useTransition()
  let [isSendDialogOpen, toggleSendDialog] = useState(false)

  let _action = submission?.formData.get('_action')
  let submittingSend = state === 'submitting' && _action === 'send'

  if (!problem) {
    return <h1>Not found</h1>
  }

  let canDelete = userId === problem.created_by_id
  let didLike = problem.likes.some((l) => l.user_id === userId)
  let didSent = problem.sends.some((l) => l.user_id === userId)

  return (
    <Stack spacing={2}>
      <img
        src={trImg(problem.image_url, 400)}
        alt=""
        style={{ height: 350, objectFit: 'scale-down' }}
      />

      <Form method="post" replace>
        <Stack direction="row" justifyContent="space-between">
          <LoadingButton
            variant={didLike ? 'contained' : 'outlined'}
            startIcon={<ThumbUpOutlined />}
            loading={state === 'submitting' && _action === 'like'}
            loadingPosition="start"
            type="submit"
            name="_action"
            value="like"
          >
            Like ({problem.likes.length})
          </LoadingButton>

          <Button
            startIcon={<Check />}
            variant={didSent ? 'contained' : 'outlined'}
            onClick={() => toggleSendDialog(true)}
          >
            Send
          </Button>

          {canDelete && (
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
          )}
        </Stack>
      </Form>

      <Dialog open={isSendDialogOpen || submittingSend} fullWidth>
        <Form method="post" replace>
          <DialogTitle>Well done! Tell me more!</DialogTitle>

          <DialogContent>
            <SendProblemForm {...send} />
          </DialogContent>

          <DialogActions>
            <Button onClick={() => toggleSendDialog(false)}>Cancel</Button>
            <LoadingButton
              type="submit"
              name="_action"
              value="send"
              variant="contained"
              loading={submittingSend}
              onClick={() => toggleSendDialog(false)}
            >
              Ok
            </LoadingButton>
          </DialogActions>
        </Form>
      </Dialog>
    </Stack>
  )
}
