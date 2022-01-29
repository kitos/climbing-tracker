import { prisma } from '../../../../../lib/prisma'
import { DataFunctionArgs } from '@remix-run/server-runtime/routeModules'
import { useLoaderData } from '@remix-run/react'

export let loader = ({ params }: DataFunctionArgs) =>
  prisma.problem.findUnique({ where: { id: params.problem_id } })

export default function ProblemPage() {
  let problem = useLoaderData<Awaited<ReturnType<typeof loader>>>()

  if (!problem) {
    return <h1>Not found</h1>
  }

  return (
    <div>
      <h1>{problem.id}</h1>
      <img src={problem.image_url} alt="" />
    </div>
  )
}
