import sgMail from '@sendgrid/mail'
import invariant from '@remix-run/dev/invariant'

invariant(process.env.SENDGRID_API_KEY, 'SENDGRID_API_KEY is required!')
invariant(process.env.MAGIC_EMAIL_FROM, 'MAGIC_EMAIL_FROM is required!')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

let siteDomain = process.env.VERCEL
  ? `https://climbing-tracker.vercel.app`
  : 'http://localhost:3000'

export let sendMagicLinkEmail = (to: string, token: string) =>
  sgMail.send({
    to,
    from: process.env.MAGIC_EMAIL_FROM!,
    subject: '[Climbing Tracker] Magic Link',
    html: `Click <a href="${siteDomain}/magic?_t=${token}">here</a> to login.`,
  })
