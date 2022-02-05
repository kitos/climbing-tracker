import { Chip } from '@mui/material'
import { colors } from '~/problem'

export let HoldAndColor = ({
  hold_type = '',
  color,
}: {
  hold_type?: string | null
  color: string
}) => {
  let { hex, textColor } =
    colors.find(({ name }) => name === color) ?? colors[0]

  return (
    <Chip
      label={hold_type?.split(',').join(' & ')}
      size="small"
      sx={{
        background: hex,
        color: textColor,
        border: color === 'white' ? '1px solid gray' : undefined,
      }}
    />
  )
}
