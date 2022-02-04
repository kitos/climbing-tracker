import { Form, Link, useLoaderData } from '@remix-run/react'
import { ActionFunction, redirect } from 'remix'
import { DataFunctionArgs } from '@remix-run/server-runtime/routeModules'
import { Badge, Button, IconButton, Stack, Typography } from '@mui/material'
import { Delete, Done, DoneAll } from '@mui/icons-material'
import { prisma } from '~/prisma'
import { getUserId, requireUserId } from '~/session.server'
import { ProblemList } from '~/components/ProblemList'

export let loader = async ({ request, params }: DataFunctionArgs) => {
  let [userId, gym] = await Promise.all([
    getUserId(request),
    prisma.gym.findUnique({
      select: {
        id: true,
        name: true,
        problems: {
          include: {
            sends: { select: { user_id: true, grade: true } },
          },
        },
        created_by_id: true,
      },
      where: { id: params.gym_id },
    }),
  ])

  return { userId, gym }
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
  let { userId, gym } = useLoaderData<IGym>()

  if (!gym) {
    return null
  }

  let canDelete = userId === gym.created_by_id

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography component="h1" variant="h5">
          {gym.name}
        </Typography>

        {canDelete && (
          <Form method="delete">
            <IconButton type="submit" color="error">
              <Delete />
            </IconButton>
          </Form>
        )}
      </Stack>

      <ProblemList
        header="Problems"
        problems={gym.problems.map((p) => ({ ...p, gymId: gym!.id }))}
        renderSecondaryAction={(p) => {
          if (p.sends.length === 0) {
            return null
          }

          let didSent = p.sends.some((s) => s.user_id === userId)

          return (
            <Badge
              badgeContent={p.sends.length}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
            >
              {didSent ? (
                <DoneAll color="success" />
              ) : (
                <Done color="disabled" />
              )}
            </Badge>
          )
        }}
      />

      <Button component={Link} variant="contained" to="problem/new">
        Add new problem
      </Button>
    </Stack>
  )
}
