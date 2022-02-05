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
import { avg, avgGrade, grades } from '~/problem'

export let loader = async ({ request }: DataFunctionArgs) => {
  let id = await requireUserId(request)
  let now = Date.now()

  let [user, yearStats] = await Promise.all([
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
    prisma.send.groupBy({
      by: ['problem_id'],
      where: {
        problem: {
          sends: { some: { user_id: id, date: { gt: startOfYear(now) } } },
        },
      },
      _avg: { grade: true },
      _max: { grade: true },
    }),
  ])

  let avgGradeYear = Math.round(avg(yearStats.map((y) => y._avg.grade!)))
  let topGradeYear = Math.max(0, ...yearStats.map((y) => y._max.grade!))

  if (!user) {
    await logout(request)
  }

  return { user, sentYear: yearStats.length, avgGradeYear, topGradeYear }
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
  let { user, ...stats } = useLoaderData<Awaited<ReturnType<typeof loader>>>()
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
        {...stats}
        sentMonth={user.sends.length}
        avgGradeMonth={avgGrade(user.sends)}
        topGradeMonth={Math.max(0, ...user.sends.map((s) => s.grade))}
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

type AbsPartial<T> = {
  [P in keyof T]?: T[P] | null
}

let Stats = (
  props: AbsPartial<{
    sentMonth: number
    sentYear: number
    avgGradeMonth: number
    avgGradeYear: number
    topGradeMonth: number
    topGradeYear: number
  }>
) => (
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

      <StatsRow metric="Sent" month={props.sentMonth} year={props.sentYear} />

      <StatsRow
        metric="Avg grade"
        month={props.avgGradeMonth && grades[props.avgGradeMonth].font}
        year={props.avgGradeYear && grades[props.avgGradeYear].font}
      />

      <StatsRow
        metric="Top grade"
        month={props.topGradeMonth && grades[props.topGradeMonth].font}
        year={props.topGradeYear && grades[props.topGradeYear].font}
      />
    </Grid>
  </Box>
)

let StatsRow = (
  props: AbsPartial<{
    metric: string
    month: number | string
    year: number | string
  }>
) => (
  <Grid container item spacing={3}>
    <Grid item xs={4}>
      <Typography variant="overline">{props.metric}</Typography>
    </Grid>
    <Grid item xs={4}>
      <Typography variant="body1">{props.month || '-'}</Typography>
    </Grid>
    <Grid item xs={4}>
      <Typography variant="body1">{props.year || '-'}</Typography>
    </Grid>
  </Grid>
)
