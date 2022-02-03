import { ActionFunction } from 'remix'
import { LoadingButton } from '@mui/lab'
import { Stack, TextField } from '@mui/material'
import { Form, useLoaderData, useTransition } from '@remix-run/react'
import { DataFunctionArgs } from '@remix-run/server-runtime/routeModules'
import { logout, requireUserId } from '~/session.server'
import { ProblemList } from '~/components/ProblemList'
import { prisma } from '~/prisma'

export let loader = async ({ request }: DataFunctionArgs) => {
  let id = await requireUserId(request)
  let user = await prisma.user.findUnique({
    select: {
      id: true,
      name: true,
      sends: {
        select: {
          date: true,
          problem: {
            include: {
              gym: { select: { id: true } },
              sends: { select: { grade: true } },
              _count: { select: { likes: true } },
            },
          },
        },
      },
    },
    where: { id },
  })

  if (!user) {
    await logout(request)
  }

  return user
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
  let user = useLoaderData<Awaited<ReturnType<typeof loader>>>()!
  let { state } = useTransition()

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

      <ProblemList
        header="Send problems"
        problems={user.sends.map((s) => ({
          ...s.problem,
          gymId: s.problem.gym.id,
          date: s.date,
        }))}
      />
    </Stack>
  )
}
