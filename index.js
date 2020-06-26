const Telegraf = require('telegraf')
const runes = require('runes')
const mongoose = require('mongoose')
require('dotenv').config()

const {Extra, Markup} = require('telegraf')

const bot = new Telegraf(process.env.BOT_TOKEN)

const {shuffle, formatHTML} = require('./utils')

bot.use(require('./users'))

const processText = (text) => {
  return text.replace(/(?<=^|\s).+?(?=$|[,.!?:\-—]|\s)/g, (word) => {
    const chars = runes(word)
    if (chars.length <= 3) {
      return word
    }
    return chars[0] + shuffle(chars.slice(1, chars.length - 1)).join('') + chars[chars.length - 1]
  })
}

bot.on('inline_query', async (ctx) => {
  if (ctx.inlineQuery.query.length === 0) {
    return ctx.answerInlineQuery([], {
      cache_time: 0,
      is_personal: true,
      switch_pm_text: 'Type a message or click here',
      switch_pm_parameter: 'from_inline'
    })
  }
  console.log(`${new Date()} ${ctx.from.id} inline`)
  const result = processText(ctx.inlineQuery.query)
  return ctx.answerInlineQuery([{
    type: 'article',
    id: ctx.inlineQuery.id,
    title: result,
    input_message_content: {
      message_text: result,
    },
  }])
})

bot.start((ctx) => {
  return ctx.reply(`Привет, я перемешиваю буквы в словах. По рзеузльаттам илссоевадний одонго анлигсйокго унвиертисета, это никак не влияет на читаемость текста 😅

Я работаю как в ЛС (напиши мне любое сообщение), так и в инлайн-режиме (напиши @${ctx.botInfo.username} в окне сообщения).
Лимит на длину сообщения в инлайн-режиме — 256 символов.

Полный текст исследования:
По рзеузльаттам илссоевадний одонго анлигсйокго унвиертисета, не иеемт занчнеия, в каокм проякде рсапжоолены бкувы в солве. Галовне, чотбы преавя и пслонедяя бквуы блыи на мсете. осатьлыне бкувы мгоут селдовтаь в плоонм бсепордяке, все-рвано ткест чтаитсея без побрелм. Пичрионй эгото ялвятеся то, что мы не чиаетм кдаужю бкуву по отдльенотси, а все солво цлиеком.

Have fun.
Автор — @Loskir.
Мой канал — @Loskirs.
Исходники — http://github.com/Loskir/shffl_bot`, Extra.HTML().webPreview(false))
})
bot.on('text', (ctx) => {
  console.log(`${new Date()} ${ctx.from.id} text`)
  return ctx.reply(
    formatHTML(processText(ctx.message.text), ctx.message.entities),
    Extra.HTML().markup(Markup.inlineKeyboard([
      Markup.callbackButton('Перемешать', 'reshuffle'),
    ])),
  )
})
bot.action('reshuffle', async (ctx) => {
  console.log(`${new Date()} ${ctx.from.id} reshuffle`)
  await ctx.answerCbQuery().catch(console.log)
  return ctx.editMessageText(
    formatHTML(processText(ctx.callbackQuery.message.text), ctx.callbackQuery.message.entities),
    Extra.HTML().markup(Markup.inlineKeyboard([
      Markup.callbackButton('Перемешать', 'reshuffle'),
    ])),
  ).catch(console.log)
})

void (async () => {
  await mongoose.connect(process.env.MONGO_URL, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })

  await bot.launch()

  console.log(`@${bot.options.username} is running`)
})()