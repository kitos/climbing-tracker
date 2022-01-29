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
import { Layout, Typography } from 'antd'

export let meta: MetaFunction = () => {
  return { title: 'New Remix App' }
}

export let links = () => [{ rel: 'stylesheet', href: styles }]

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
            <Typography.Title style={{ color: '#fff' }}>
              Climbing Tracker
            </Typography.Title>
          </Layout.Header>

          <Layout.Content style={{ padding: 50 }}>
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
