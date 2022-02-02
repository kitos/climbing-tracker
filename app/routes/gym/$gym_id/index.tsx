import { Form, Link, useLoaderData } from '@remix-run/react'
import { ActionFunction, redirect } from 'remix'
import { DataFunctionArgs } from '@remix-run/server-runtime/routeModules'
import {
  Avatar,
  Badge,
  Button,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  ListSubheader,
  Stack,
} from '@mui/material'
import { Delete, ThumbUp, CheckBox } from '@mui/icons-material'
import { prisma } from '../../../../lib/prisma'
import { getUserId, requireUserId } from '../../../session.server'
import { trImg } from '../../../image'
import { grades } from '../../../problem/grades'

export let loader = async ({ request, params }: DataFunctionArgs) => {
  let [userId, gym] = await Promise.all([
    getUserId(request),
    prisma.gym.findUnique({
      select: {
        id: true,
        name: true,
        problems: {
          include: {
            sends: { select: { grade: true } },
            _count: { select: { likes: true } },
          },
        },
        created_by_id: true,
      },
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
    return null
  }

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between">
        <h1>{gym.name}</h1>

        {canDelete && (
          <Form method="delete">
            <IconButton type="submit" color="error">
              <Delete />
            </IconButton>
          </Form>
        )}
      </Stack>

      <List subheader={<ListSubheader>Problems</ListSubheader>}>
        {gym.problems.map((problem) => {
          let avgSendGrade = Math.ceil(
            problem.sends.map((s) => s.grade).reduce((s, g) => s + g, 0) /
              problem.sends.length
          )

          return (
            <ListItem
              key={problem.id}
              disablePadding
              secondaryAction={
                <Stack direction="row" spacing={2}>
                  {problem._count.likes ? (
                    <Badge
                      badgeContent={problem._count.likes}
                      color="success"
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                      }}
                    >
                      <ThumbUp />
                    </Badge>
                  ) : null}
                </Stack>
              }
            >
              <ListItemButton component={Link} to={`problem/${problem.id}`}>
                <ListItemAvatar>
                  <Badge
                    badgeContent={
                      avgSendGrade
                        ? grades[avgSendGrade].font
                        : problem.gym_grade
                    }
                    color="primary"
                  >
                    <Avatar variant="rounded" src={trImg(problem.image_url)} />
                  </Badge>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Chip
                      label={problem.hold_type}
                      size="small"
                      style={{ background: problem.color }}
                    />
                  }
                  secondary={new Date(problem.date).toLocaleDateString()}
                />
              </ListItemButton>
            </ListItem>
          )
        })}
      </List>

      <Button component={Link} variant="contained" to="problem/new">
        Add new problem
      </Button>
    </Stack>
  )
}
