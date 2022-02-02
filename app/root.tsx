import { useEffect, useState } from 'react'
import type { MetaFunction } from 'remix'
import { DataFunctionArgs } from '@remix-run/server-runtime/routeModules'
import { Link, useLoaderData, useTransition } from '@remix-run/react'
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from 'remix'
import {
  AppBar,
  Box,
  IconButton,
  LinearProgress,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  CssBaseline,
} from '@mui/material'
import { AccountCircle } from '@mui/icons-material'
import { getUserId } from './session.server'

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

let menuId = 'user-menu'

export let loader = ({ request }: DataFunctionArgs) => getUserId(request)

export default function App() {
  let userId = useLoaderData<Awaited<ReturnType<typeof loader>>>()
  let [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  let closeMenu = () => setAnchorEl(null)

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
        <AppBar position="static">
          <Toolbar>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="open drawer"
              sx={{ mr: 2 }}
            >
              <Link to="/" style={{ textDecoration: 'none' }}>
                🧗‍♀️
              </Link>
            </IconButton>

            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ flexGrow: 1 }}
            >
              <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>
                Tracker
              </Link>
            </Typography>

            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls={menuId}
              aria-haspopup="true"
              onClick={(e) => setAnchorEl(e.currentTarget)}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              id={menuId}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={closeMenu}
            >
              <MenuItem
                component={Link}
                to={userId ? '/logout' : '/login'}
                onClick={closeMenu}
              >
                {userId ? 'Logout' : 'Login'}
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

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
