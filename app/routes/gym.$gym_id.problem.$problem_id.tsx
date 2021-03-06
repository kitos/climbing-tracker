import { useState } from 'react'
import { ActionFunction, redirect } from 'remix'
import { Form, Link, useLoaderData, useTransition } from '@remix-run/react'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Stack,
  Typography,
} from '@mui/material'
import { LoadingButton } from '@mui/lab'
import {
  Check,
  DeleteOutlined,
  DoneAll,
  ThumbUpOutlined,
} from '@mui/icons-material'
import { DataFunctionArgs } from '@remix-run/server-runtime/routeModules'
import { getUserId, requireUserId } from '~/session.server'
import { trImg } from '~/image'
import { prisma } from '~/prisma'
import { SendProblemForm } from '~/components/SendProblemForm'
import { formatRelative } from '~/date'
import { GymAvatar } from '~/components/GymAvatar'
import { HoldAndColor } from '~/components/HoldAndColor'
import { avgGrade, grades } from '~/problem'

export let loader = async ({ request, params }: DataFunctionArgs) => {
  let problem_id = params.problem_id!
  let user_id = await getUserId(request)

  let [problem, send] = await Promise.all([
    prisma.problem.findUnique({
      include: {
        gym: { select: { id: true, name: true, logo: true } },
        likes: { select: { user_id: true } },
        sends: {
          select: {
            date: true,
            grade: true,
            sender: { select: { id: true, name: true } },
          },
        },
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
  let didSent = problem.sends.some((l) => l.sender.id === userId)
  let avgSentGrade = avgGrade(problem.sends)

  return (
    <Stack spacing={2}>
      <Stack
        component={Link}
        to={`/gym/${problem.gym.id}`}
        direction="row"
        spacing={2}
        alignItems="center"
        sx={{ textDecoration: 'none', color: 'inherit' }}
      >
        <GymAvatar logo={problem.gym.logo} />

        <Typography component="h1" variant="h5">
          {problem.gym.name}
        </Typography>
      </Stack>

      <img
        src={trImg(problem.image_url, { h: 400 })}
        style={{ height: 350, objectFit: 'scale-down' }}
      />

      <Stack spacing={1}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="overline">Set:</Typography>
          <Typography>
            {formatRelative(new Date(problem.date), Date.now())}
          </Typography>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="overline">Holds:</Typography>
          <HoldAndColor {...problem} />
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="overline">Gym grade:</Typography>
          <Typography>{problem.gym_grade}</Typography>
        </Stack>

        {avgSentGrade ? (
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="overline">Avg sent grade:</Typography>
            <Typography>{grades[avgSentGrade].font}</Typography>
          </Stack>
        ) : null}
      </Stack>

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
            Send ({problem.sends.length})
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

      <List subheader={<ListSubheader>Sends</ListSubheader>} dense>
        {problem.sends.map((send) => (
          <ListItem key={send.sender.id}>
            <ListItemIcon>
              <DoneAll />
            </ListItemIcon>

            <ListItemText
              primary={send.sender.name}
              secondary={formatRelative(new Date(send.date), Date.now())}
            />
          </ListItem>
        ))}
      </List>

      <Dialog open={isSendDialogOpen || submittingSend} fullWidth>
        <Form method="post" replace>
          <DialogTitle>Well done! Tell me more!</DialogTitle>

          <DialogContent>
            <SendProblemForm
              {...(send ?? (avgSentGrade ? { grade: avgSentGrade } : null))}
            />
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
