import { Chip } from '@mui/material'
import { colors } from '~/problem'

export let HoldAndColor = ({
  hold_type = '',
  color,
}: {
  hold_type?: string | null
  color: string
}) => (
  <Chip
    label={hold_type?.split(',').join(' & ')}
    size="small"
    style={{ background: colors.find(({ name }) => name === color)?.hex }}
  />
)
