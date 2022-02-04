import {
  Avatar,
  Badge,
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  ListSubheader,
} from '@mui/material'
import { Link } from '@remix-run/react'
import { avgGrade, colors, grades } from '~/problem'
import { trImg } from '~/image'
import { formatRelative } from '~/date'
import { ReactNode } from 'react'
import { HoldAndColor } from '~/components/HoldAndColor'

interface IProblem {
  id: string
  gymId: string
  gym_grade: string
  image_url: string
  hold_type: string | null
  color: string
  date: Date
  sends: { grade: number }[]
}

export let ProblemList = <P extends IProblem>({
  header,
  problems,
  renderSecondaryAction,
}: {
  header?: string
  problems: P[]
  renderSecondaryAction?: (p: P) => ReactNode
}) => (
  <List subheader={header && <ListSubheader>{header}</ListSubheader>}>
    {problems.map((problem) => {
      let avgSendGrade = avgGrade(problem.sends)

      return (
        <ListItem
          key={problem.id}
          disablePadding
          secondaryAction={renderSecondaryAction?.(problem)}
        >
          <ListItemButton
            component={Link}
            to={`/gym/${problem.gymId}/problem/${problem.id}`}
          >
            <ListItemAvatar>
              <Badge
                badgeContent={
                  avgSendGrade ? grades[avgSendGrade].font : problem.gym_grade
                }
                color="primary"
              >
                <Avatar
                  variant="rounded"
                  src={trImg(problem.image_url, { h: 80 })}
                />
              </Badge>
            </ListItemAvatar>

            <ListItemText
              primary={<HoldAndColor {...problem} />}
              secondary={formatRelative(new Date(problem.date), Date.now())}
            />
          </ListItemButton>
        </ListItem>
      )
    })}
  </List>
)
