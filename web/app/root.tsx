import { useEffect, useState } from 'react'
import type { MetaFunction } from 'remix'
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from 'remix'
import { DataFunctionArgs } from '@remix-run/server-runtime/routeModules'
import { useLoaderData, useTransition } from '@remix-run/react'
import { Box, CssBaseline, LinearProgress } from '@mui/material'
import { getUserId } from './session.server'
import { AppBar } from './components/AppBar'

export let meta: MetaFunction = () => {
  return { title: 'Climbing Tracker' }
}
export let links = () => [
  {
    rel: 'icon',
    href: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🧗‍♀️</text></svg>',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap',
  },
]

export let loader = ({ request }: DataFunctionArgs) => getUserId(request)

export default function App() {
  let userId = useLoaderData<Awaited<ReturnType<typeof loader>>>()
  let { state } = useTransition()
  let [tooMuchTimePassed, showProgress] = useState(false)

  useEffect(() => {
    if (state === 'idle') {
      showProgress(false)
    } else if (state === 'loading') {
      let tid = setTimeout(() => showProgress(true), 500)
      return () => clearTimeout(tid)
    }
  }, [state])

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>

      <CssBaseline />

      <body>
        <AppBar userId={userId} />

        {state === 'loading' && tooMuchTimePassed && (
          <LinearProgress color="secondary" />
        )}

        <Box component="main" padding={2}>
          <Outlet />
        </Box>
        <ScrollRestoration />
        <Scripts />
        {process.env.NODE_ENV === 'development' && <LiveReload />}
      </body>
    </html>
  )
}
