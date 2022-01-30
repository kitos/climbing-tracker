import { createCookieSessionStorage, redirect } from 'remix'
import crypto from 'crypto'
import { prisma } from '../lib/prisma'
import { sign, verify } from './jwt.server'
import { sendMagicLinkEmail } from './mail.server'
import invariant from '@remix-run/dev/invariant'

invariant(process.env.JWT_SECRET, 'JWT_SECRET is required!')

let sessionStorage = createCookieSessionStorage({
  cookie: {
    name: '__session',
    secure: true,
    httpOnly: true,
    sameSite: 'lax',
    secrets: [process.env.JWT_SECRET],
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  },
})

export let getUserSession = (request: Request) =>
  sessionStorage.getSession(request.headers.get('Cookie'))

export let getUserId = async (request: Request) => {
  let session = await getUserSession(request)
  let userId = session.get('userId')
  if (!userId || typeof userId !== 'string') return null
  return userId
}

export let requireUserId = async (
  request: Request,
  redirectTo: string = new URL(request.url).pathname
) => {
  const userId = await getUserId(request)

  if (!userId) {
    const searchParams = new URLSearchParams([['redirectTo', redirectTo]])
    throw redirect(`/login?${searchParams}`)
  }

  return userId
}

export let createUserSession = async (userId: string, redirectTo: string) => {
  let session = await sessionStorage.getSession()
  session.set('userId', userId)

  return redirect(redirectTo, {
    headers: {
      'Set-Cookie': await sessionStorage.commitSession(session),
    },
  })
}

export let initMagicLogin = async (email: string, redirectTo: string) => {
  let magicKey = crypto.randomBytes(24).toString('hex')
  let jwtToken = await sign({ magicKey, redirectTo })

  await sendMagicLinkEmail(email, jwtToken)

  await prisma.user.upsert({
    select: { id: true },
    create: { email, name: 'default', magic_key: magicKey },
    update: { magic_key: magicKey },
    where: { email },
  })

  return redirect('/magic')
}

export let finishMagicLogin = async (jwtToken: string) => {
  try {
    let { magicKey, redirectTo } = await verify(jwtToken)
    let user = await prisma.user.findFirst({ where: { magic_key: magicKey } })

    if (user) {
      return createUserSession(user.id, redirectTo ?? '/')
    } else {
      return redirect('/login')
    }
  } catch (e) {
    return redirect('/login')
  }
}
