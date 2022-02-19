import { Form, Link, useLoaderData } from '@remix-run/react'
import { ActionFunction, redirect, useSearchParams } from 'remix'
import { DataFunctionArgs } from '@remix-run/server-runtime/routeModules'
import {
  Badge,
  Button,
  Drawer,
  IconButton,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import { Add, Delete, Done, DoneAll, FilterList } from '@mui/icons-material'
import { prisma } from '~/prisma'
import { getUserId, requireUserId } from '~/session.server'
import { ProblemList } from '~/components/ProblemList'
import { GymAvatar } from '~/components/GymAvatar'
import { useCallback, useState } from 'react'
import { ProblemFilters } from '~/components/ProblemFilters'
import { IProblemFilter, isDefaultGymGrade, parseGymGrade } from '~/filters'
import { unstable_debounce as debounce } from '@mui/utils'

export let loader = async ({ request, params }: DataFunctionArgs) => {
  let { hide_sent, gym_grade } = Object.fromEntries(
    new URL(request.url).searchParams
  )
  let [minGymGrade, maxGymGrade] = parseGymGrade(gym_grade ?? '')

  let userId = await getUserId(request)
  let gym = await prisma.gym.findUnique({
    select: {
      id: true,
      name: true,
      logo: true,
      problems: {
        include: { sends: { select: { user_id: true, grade: true } } },
        where: {
          AND: [
            { gym_grade: { gte: String(minGymGrade) } },
            { gym_grade: { lte: String(maxGymGrade) } },
          ],
          ...(userId && hide_sent === 'true'
            ? { sends: { none: { user_id: userId } } }
            : null),
        },
        orderBy: { date: 'desc' },
      },
      created_by_id: true,
    },
    where: { id: params.gym_id },
  })

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
  let [filtersOpen, toggleFilters] = useState(false)
  let [searchParams, setSearchParams] = useSearchParams()
  let debouncedSetSearchParams = useCallback(debounce(setSearchParams, 300), [])
  let [filterValues, setFilters] = useState(
    () =>
      Object.fromEntries(searchParams) as Record<IProblemFilter, string | null>
  )
  let isSomeFilterActive =
    !isDefaultGymGrade(parseGymGrade(filterValues.gym_grade ?? '')) ||
    filterValues.hide_sent === 'true'

  let setFilter = (name: IProblemFilter, value: string) => {
    let newFilters = { ...filterValues, [name]: value }
    setFilters(newFilters)
    debouncedSetSearchParams(newFilters as any)
  }

  if (!gym) {
    return null
  }

  let canDelete = userId === gym.created_by_id

  return (
    <Stack spacing={2} mb={6}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Stack direction="row" alignItems="center" spacing={2}>
          <GymAvatar logo={gym.logo} />

          <Typography component="h1" variant="h5">
            {gym.name}
          </Typography>
        </Stack>

        {canDelete && (
          <Form method="delete">
            <IconButton type="submit" color="error">
              <Delete />
            </IconButton>
          </Form>
        )}
      </Stack>

      <ProblemList
        header={
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <span>Problems</span>

            <IconButton
              aria-label="Open filters"
              onClick={() => toggleFilters(true)}
            >
              <Badge
                color="primary"
                variant="dot"
                invisible={!isSomeFilterActive}
              >
                <FilterList />
              </Badge>
            </IconButton>
          </Stack>
        }
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

      <Paper
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          padding: 2,
          zIndex: 1,
        }}
        elevation={3}
      >
        <Button
          component={Link}
          startIcon={<Add />}
          variant="contained"
          to="problem/new"
          fullWidth
        >
          Add new problem
        </Button>
      </Paper>

      <Drawer
        anchor="bottom"
        open={filtersOpen}
        onClose={() => toggleFilters(false)}
        sx={{ minWidth: '80vw', [`& .MuiDrawer-paper`]: { minWidth: '80vw' } }}
      >
        <ProblemFilters values={filterValues} onChange={setFilter} />
      </Drawer>
    </Stack>
  )
}
