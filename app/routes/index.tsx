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
  Paper,
  Stack,
} from '@mui/material'
import { Add, Landscape, Public } from '@mui/icons-material'
import { prisma } from '~/prisma'
import { trImg } from '~/image'
import { GymAvatar } from '~/components/GymAvatar'

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
                    <GymAvatar logo={gym.logo} />
                  </ListItemAvatar>
                }

                <ListItemText primary={gym.name} secondary={gym.address} />
              </ListItemButton>
            </ListItem>

            {i < gyms.length - 1 && <Divider component="li" />}
          </Fragment>
        ))}
      </List>

      <Paper
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          padding: 2,
          zIndex: 1,
        }}
        elevation={3}
      >
        <Button
          component={Link}
          startIcon={<Add />}
          variant="contained"
          to="/gym/new"
          fullWidth
        >
          Add new gym
        </Button>
      </Paper>
    </Stack>
  )
}
