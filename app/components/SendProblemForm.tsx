import { useState } from 'react'
import {
  FormControl,
  FormControlLabel,
  FormLabel,
  IconButton,
  Radio,
  RadioGroup,
  Slider,
  Stack,
  TextField,
} from '@mui/material'
import { AddCircle, RemoveCircle } from '@mui/icons-material'
import { grades } from '~/problem'

export let SendProblemForm = ({
  date: defaultDate = new Date(),
  attempts: defaultAttempts = 'flash',
  grade: defaultGrade = Math.round(grades.length / 2),
}) => {
  let [grade, setGrade] = useState(defaultGrade)

  return (
    <Stack spacing={2} paddingTop={1}>
      <TextField
        type="date"
        name="date"
        defaultValue={new Date(defaultDate).toISOString().substring(0, 10)}
        label="When was it?"
        variant="outlined"
      />

      <FormControl>
        <FormLabel id="attempts-label">How hard was it?</FormLabel>

        <RadioGroup
          aria-labelledby="attempts-label"
          defaultValue={defaultAttempts}
          name="attempts"
        >
          <FormControlLabel control={<Radio />} label="Flashed" value="flash" />
          <FormControlLabel
            control={<Radio />}
            label="Second go"
            value="second_go"
          />
          <FormControlLabel
            control={<Radio />}
            label="Some attempts"
            value="some_attempts"
          />
          <FormControlLabel
            control={<Radio />}
            label="Finished project"
            value="project"
          />
        </RadioGroup>
      </FormControl>
      <FormControl>
        <FormLabel id="grade-label">What about grade?</FormLabel>

        <Stack direction="row" spacing={1} marginTop={3}>
          <IconButton
            aria-label="increase"
            color="secondary"
            disabled={grade === 0}
            onClick={() => setGrade(grade - 1)}
          >
            <RemoveCircle />
          </IconButton>

          <Slider
            name="grade"
            aria-labelledby="grade-label"
            min={0}
            max={grades.length - 1}
            value={grade}
            onChange={(_, v) => setGrade(v as number)}
            marks
            track={false}
            valueLabelDisplay="on"
            valueLabelFormat={(i) => {
              let { v, font } = grades[i]
              return `${v} / ${font}`
            }}
          />

          <IconButton
            aria-label="decrease"
            color="success"
            disabled={grade === grades.length - 1}
            onClick={() => setGrade(grade + 1)}
          >
            <AddCircle />
          </IconButton>
        </Stack>
      </FormControl>
    </Stack>
  )
}
