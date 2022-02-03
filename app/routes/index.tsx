import { Fragment } from 'react'
import { Link, useLoaderData } from '@remix-run/react'
import {
  Avatar,
  Button,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  ListSubheader,
  Stack,
} from '@mui/material'
import { Landscape, Public } from '@mui/icons-material'
import { prisma } from '~/prisma'
import { trImg } from '~/image'

export let loader = () =>
  prisma.gym.findMany({
    select: { id: true, name: true, address: true, site: true, logo: true },
  })

export default function Index() {
  let gyms = useLoaderData<Awaited<ReturnType<typeof loader>>>()

  return (
    <Stack spacing={2}>
      <List subheader={<ListSubheader>Gyms</ListSubheader>}>
        {gyms.map((gym, i) => (
          <Fragment key={gym.id}>
            <ListItem
              disablePadding
              secondaryAction={
                gym.site && (
                  <IconButton href={gym.site} target="_blank" rel="noopener">
                    <Public />
                  </IconButton>
                )
              }
            >
              <ListItemButton component={Link} to={`/gym/${gym.id}`}>
                {
                  <ListItemAvatar>
                    {gym.logo ? (
                      <Avatar variant="rounded" src={trImg(gym.logo, 80)} />
                    ) : (
                      <Avatar>
                        <Landscape />
                      </Avatar>
                    )}
                  </ListItemAvatar>
                }

                <ListItemText primary={gym.name} secondary={gym.address} />
              </ListItemButton>
            </ListItem>

            {i < gyms.length - 1 && <Divider component="li" />}
          </Fragment>
        ))}
      </List>

      <Button component={Link} variant="contained" to="/gym/new">
        Add new gym
      </Button>
    </Stack>
  )
}
