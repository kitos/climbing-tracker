import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from 'remix'
import type { MetaFunction } from 'remix'
import styles from 'antd/dist/antd.css'
import { Layout } from 'antd'
import { Link } from '@remix-run/react'

export let meta: MetaFunction = () => {
  return { title: 'New Remix App' }
}

export let links = () => [
  { rel: 'stylesheet', href: styles },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap',
  },
]

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Layout>
          <Layout.Header>
            <Link style={{ fontSize: 32 }} to="/">
              🧗‍♀️
            </Link>
          </Layout.Header>

          <Layout.Content style={{ background: '#fff', padding: 16 }}>
            <Outlet />
          </Layout.Content>
        </Layout>
        <ScrollRestoration />
        <Scripts />
        {process.env.NODE_ENV === 'development' && <LiveReload />}
      </body>
    </html>
  )
}
