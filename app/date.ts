import { formatRelative as fr, Locale } from 'date-fns'
import { enGB } from 'date-fns/locale'

const formatRelativeLocale: Record<string, string> = {
  lastWeek: "'Last' eeee",
  yesterday: "'Yesterday'",
  today: "'Today'",
  tomorrow: "'Tomorrow'",
  nextWeek: "'Next' eeee",
  other: 'dd.MM.yyyy',
}

const locale = {
  ...enGB,
  formatRelative: (token: string) => formatRelativeLocale[token],
}

export let formatRelative = (date: Date | number, base: Date | number) =>
  fr(date, base, { locale })
