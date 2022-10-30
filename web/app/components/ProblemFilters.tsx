import {
  Checkbox,
  FormControlLabel,
  Slider,
  Stack,
  Typography,
} from '@mui/material'
import { grades } from '~/problem'
import { useState } from 'react'
import { Form, useSubmit } from '@remix-run/react'
import { Simulate } from 'react-dom/test-utils'
import submit = Simulate.submit
import { useSearchParams } from 'remix'
import {
  IProblemFilter,
  MAX_GYM_GRADE,
  MIN_GYM_GRADE,
  parseGrade,
  parseGymGrade,
} from '~/filters'

export let ProblemFilters = ({
  values: { gym_grade, hide_sent },
  onChange,
}: {
  values: Record<IProblemFilter, string | null>
  onChange: (name: IProblemFilter, value: string) => void
}) => (
  <Stack p={2} spacing={2}>
    <div>
      <Typography id="gym-grade-label" gutterBottom>
        Gym grade
      </Typography>

      <Slider
        aria-labelledby="grade-label"
        min={MIN_GYM_GRADE}
        max={MAX_GYM_GRADE}
        value={parseGymGrade(gym_grade ?? '')}
        onChange={(_, v) => onChange('gym_grade', (v as number[]).join(','))}
        marks
        valueLabelDisplay="auto"
      />
    </div>

    <FormControlLabel
      control={
        <Checkbox
          checked={hide_sent === 'true'}
          onChange={(e) => onChange('hide_sent', String(e.target.checked))}
        />
      }
      label="Hide sent"
    />
  </Stack>
)
