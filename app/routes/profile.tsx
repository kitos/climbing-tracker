import type React from 'react'
import { ActionFunction } from 'remix'
import { startOfMonth, startOfYear } from 'date-fns'
import { LoadingButton } from '@mui/lab'
import { Box, Divider, Grid, Stack, TextField, Typography } from '@mui/material'
import { Form, useLoaderData, useTransition } from '@remix-run/react'
import { DataFunctionArgs } from '@remix-run/server-runtime/routeModules'
import { logout, requireUserId } from '~/session.server'
import { ProblemList } from '~/components/ProblemList'
import { prisma } from '~/prisma'
import { avgGrade, grades } from '~/problem'

export let loader = async ({ request }: DataFunctionArgs) => {
  let id = await requireUserId(request)
  let now = Date.now()
  let inThisYear = { where: { user_id: id, date: { gt: startOfYear(now) } } }

  let [
    sentYear,
    {
      _avg: { grade: avgGradeYear },
    },
    user,
  ] = await Promise.all([
    prisma.send.count(inThisYear),
    prisma.send.aggregate({ _avg: { grade: true }, ...inThisYear }),
    prisma.user.findUnique({
      select: {
        id: true,
        name: true,
        sends: {
          select: {
            date: true,
            grade: true,
            problem: {
              include: {
                gym: { select: { id: true } },
                sends: { select: { grade: true } },
              },
            },
          },
          where: { date: { gt: startOfMonth(now) } },
        },
      },
      where: { id },
    }),
  ])

  if (!user) {
    await logout(request)
  }

  return { user, sentYear, avgGradeYear }
}

export let action: ActionFunction = async ({ request }) => {
  let { id, name } = Object.fromEntries(await request.formData()) as Record<
    string,
    string
  >

  await prisma.user.update({ data: { name }, where: { id } })

  return null
}

export default function ProfilePage() {
  let { user, sentYear, avgGradeYear } =
    useLoaderData<Awaited<ReturnType<typeof loader>>>()
  let { state } = useTransition()

  if (!user) {
    return null
  }

  return (
    <Stack component={Form} method="post" spacing={2}>
      <input type="text" name="id" defaultValue={user.id} hidden />

      <TextField name="name" label="Name" defaultValue={user.name} required />

      <LoadingButton
        type="submit"
        variant="contained"
        loading={state === 'submitting'}
      >
        Update
      </LoadingButton>

      <Divider variant="middle">Stats</Divider>

      <Stats
        sentMonth={user.sends.length}
        sentYear={sentYear}
        avgGradeMonth={avgGrade(user.sends)}
        avgGradeYear={avgGradeYear}
      />

      <Divider variant="middle">Sent this month</Divider>

      <ProblemList
        problems={user.sends.map((s) => ({
          ...s.problem,
          gymId: s.problem.gym.id,
          date: s.date,
        }))}
      />
    </Stack>
  )
}

let Stats = ({
  sentMonth,
  sentYear,
  avgGradeMonth,
  avgGradeYear,
}: {
  sentMonth?: number | null
  sentYear?: number | null
  avgGradeMonth?: number | null
  avgGradeYear?: number | null
}) => (
  <Box sx={{ flexGrow: 1 }}>
    <Grid container spacing={1}>
      <Grid container item spacing={3}>
        <Grid item xs={4} />
        <Grid item xs={4}>
          <Typography variant="overline">Month</Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography variant="overline">Year</Typography>
        </Grid>
      </Grid>

      <Grid container item spacing={3}>
        <Grid item xs={4}>
          <Typography variant="overline">Sent</Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography variant="body1">{sentMonth ?? '-'}</Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography variant="body1">{sentYear ?? '-'}</Typography>
        </Grid>
      </Grid>

      <Grid container item spacing={3}>
        <Grid item xs={4}>
          <Typography variant="overline">Avg grade</Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography variant="body1">
            {avgGradeMonth ? grades[avgGradeMonth].font : '-'}
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography variant="body1">
            {avgGradeYear ? grades[avgGradeYear].font : '-'}
          </Typography>
        </Grid>
      </Grid>
    </Grid>
  </Box>
)
