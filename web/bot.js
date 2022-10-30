const TelegramBot = require('node-telegram-bot-api')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const token = '5378015247:AAFkshlDUgKM48CiVX710aFn1z_cJNZg6x4'

const bot = new TelegramBot(token, { polling: true })

const problems = ['easy', 'hard']

bot.onText(/\/gyms/, async (msg, match) => {
  let chat_id = msg.chat.id

  let [gyms, sent] = await Promise.all([
    pages.gyms(),
    bot.sendMessage(chat_id, 'loading...'),
  ])

  bot.editMessageText('select the gym', {
    chat_id: chat_id,
    message_id: sent.message_id,
    reply_markup: JSON.stringify(gyms),
  })
})

bot.onText(/\/problems (.+)/, (msg, match) => {
  bot.sendMessage(msg.chat.id, 'now select problem', {
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

bot.on('callback_query', async ({ id, message, data }) => {
  data = JSON.parse(data)

  // bot.answerCallbackQuery(id)
  bot.editMessageText('now select problem', {
    chat_id: message.chat.id,
    message_id: message.message_id,
    reply_markup:
      data.page === 'gyms'
        ? await pages.gyms()
        : await pages.problems(data.gym_id),
  })
})

// bot.on('message', (msg) => {
//   const chatId = msg.chat.id
//
//   // send a message to the chat acknowledging receipt of their message
//   bot.sendMessage(chatId, 'Received your message')
// })
