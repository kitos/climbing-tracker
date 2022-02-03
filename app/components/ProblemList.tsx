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
import { ThumbUp } from '@mui/icons-material'
import { Link } from '@remix-run/react'
import { grades } from '~/problem'
import { trImg } from '~/image'

interface IProblem {
  id: string
  gymId: string
  gym_grade: string
  image_url: string
  hold_type: string | null
  color: string
  date: Date
  sends: { grade: number }[]
  _count: { likes: number }
}

export let ProblemList = ({
  header = 'Problems',
  problems,
}: {
  header?: string
  problems: IProblem[]
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
          secondaryAction={
            problem._count.likes ? (
              <Badge
                badgeContent={problem._count.likes}
                color="primary"
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
              >
                <ThumbUp />
              </Badge>
            ) : null
          }
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
                  style={{ background: problem.color }}
                />
              }
              secondary={new Date(problem.date).toLocaleDateString('en-GB')}
            />
          </ListItemButton>
        </ListItem>
      )
    })}
  </List>
)
