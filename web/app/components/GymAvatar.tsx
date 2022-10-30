import { Avatar } from '@mui/material'
import { Landscape } from '@mui/icons-material'
import { trImg } from '~/image'

export let GymAvatar = ({ logo }: { logo?: string | null }) =>
  logo ? (
    <Avatar variant="rounded" src={trImg(logo, { h: 80 })} />
  ) : (
    <Avatar>
      <Landscape />
    </Avatar>
  )
