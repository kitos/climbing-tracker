import TelegramBot from 'node-telegram-bot-api'
import { prisma } from '~/prisma'
import { DataFunctionArgs } from '@remix-run/server-runtime/routeModules'

const token =
  process.env.TG_TOKEN || '5378015247:AAFkshlDUgKM48CiVX710aFn1z_cJNZg6x4'

const botToken = new TelegramBot(token, { webHook: true })

botToken.setWebHook(`https://climbing-tracker.vercel.app/bot/${token}`)

export let loader = async ({ request }: DataFunctionArgs) =>
  botToken.processUpdate((await request.formData()) as any)

botToken.onText(/\/gyms/, async (msg, match) => {
  let chat_id = msg.chat.id

  let [gyms, sent] = await Promise.all([
    pages.gyms(),
    botToken.sendMessage(chat_id, 'loading...'),
  ])

  botToken.editMessageText('select the gym', {
    chat_id: chat_id,
    message_id: sent.message_id,
    reply_markup: JSON.stringify(gyms),
  })
})

botToken.onText(/\/problems (.+)/, (msg, match) => {
  botToken.sendMessage(msg.chat.id, 'now select problem', {
    reply_markup: JSON.stringify(pages.problems(match[1])),
  })
})

let pages = {
  gyms: async () => {
    let gyms = await prisma.gym.findMany({ select: { id: true, name: true } })

    return {
      inline_keyboard: [
        ...gyms.map((gym) => [
          {
            text: gym.name,
            callback_data: JSON.stringify({ page: 'problems', gym_id: gym.id }),
          },
          {
            text: '🌐',
            web_app: {
              url: `https://climbing-tracker.vercel.app/gym/${gym.id}`,
            },
          },
        ]),
      ],
    }
  },
  problems: async (gym) => {
    let problems = await prisma.problem.findMany({
      select: { id: true, color: true, hold_type: true },
      where: { gym_id: gym },
      take: 5,
    })

    return {
      inline_keyboard: [
        ...problems.map((p) => [
          { text: `${p.color} ${p.hold_type}`, callback_data: p.color },
          {
            text: '🌐',
            web_app: {
              url: `https://climbing-tracker.vercel.app/gym/${gym}/problem/${p.id}`,
            },
          },
        ]),
        [{ text: '🔙', callback_data: JSON.stringify({ page: 'gyms' }) }],
      ],
    }
  },
}

botToken.on('callback_query', async ({ id, message, data }) => {
  if (message && data) {
    data = JSON.parse(data)

    botToken.editMessageText('now select problem', {
      chat_id: message.chat.id,
      message_id: message.message_id,
      reply_markup:
        data.page === 'gyms'
          ? await pages.gyms()
          : await pages.problems(data.gym_id),
    })
  } else {
    botToken.answerCallbackQuery(id, { text: 'Unknown callback' })
  }
})
