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
import { colors, grades } from '~/problem'
import { trImg } from '~/image'
import { formatRelative } from '~/date'
import { ReactNode } from 'react'

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
  header = 'Problems',
  problems,
  renderSecondaryAction,
}: {
  header?: string
  problems: P[]
  renderSecondaryAction?: (p: P) => ReactNode
}) => (
  <List subheader={<ListSubheader>{header}</ListSubheader>}>
    {problems.map((problem) => {
      let avgSendGrade = Math.ceil(
        problem.sends.map((s) => s.grade).reduce((s, g) => s + g, 0) /
          problem.sends.length
      )

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
                <Avatar variant="rounded" src={trImg(problem.image_url)} />
              </Badge>
            </ListItemAvatar>

            <ListItemText
              primary={
                <Chip
                  label={problem.hold_type}
                  size="small"
                  style={{
                    background: colors.find(
                      ({ name }) => name === problem.color
                    )?.hex,
                  }}
                />
              }
              secondary={formatRelative(new Date(problem.date), Date.now())}
            />
          </ListItemButton>
        </ListItem>
      )
    })}
  </List>
)
