import { useState } from 'react'
import { Form as RemixForm, useTransition } from '@remix-run/react'
import {
  ActionFunction,
  LoaderFunction,
  redirect,
  unstable_parseMultipartFormData as parseMultipartFormData,
  unstable_createFileUploadHandler as createFileUploadHandler,
} from 'remix'
import {
  Button,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Slider,
  Stack,
  Typography,
} from '@mui/material'
import { LoadingButton } from '@mui/lab'
import { UploadFile } from '@mui/icons-material'
import { prisma } from '~/prisma'
import { requireUserId } from '~/session.server'
import { uploadImage } from '~/routes/imagekitUploader.server'
import { Photo } from '~/Photo'
import { colors, holdTypes } from '~/problem'

export let loader: LoaderFunction = ({ request }) => requireUserId(request)

export let action: ActionFunction = async ({ params: { gym_id }, request }) => {
  let userId = await requireUserId(request)

  let formData = await parseMultipartFormData(
    request,
    createFileUploadHandler({ maxFileSize: Number.MAX_SAFE_INTEGER })
  )
  let img = formData.get('img') as any
  let cdnImage = await uploadImage(img.name, img.stream())

  await prisma.problem.create({
    data: {
      gym: { connect: { id: gym_id! } },
      created_by: { connect: { id: userId } },
      date: new Date(),
      image_url: cdnImage.url,
      color: formData.get('color') as string,
      gym_grade: formData.get('gym_grade') as string,
      hold_type: formData.get('hold_type') as string,
      wall_type: formData.get('wall_type') as string,
      style: formData.get('style') as string,
    },
  })

  return redirect(`/gym/${gym_id}`)
}

export default function NewProblem() {
  let { state } = useTransition()
  let [img, setImg] = useState<File>()

  return (
    <RemixForm method="post" encType="multipart/form-data">
      <Stack spacing={2}>
        <Photo file={img} />

        <label>
          <input
            onChange={(e) => setImg(e.target.files?.[0])}
            accept="image/*"
            type="file"
            name="img"
            hidden
          />
          <Button
            variant="contained"
            startIcon={<UploadFile />}
            component="span"
          >
            Upload image
          </Button>
        </label>

        <FormControl fullWidth>
          <InputLabel id="color-label">Color</InputLabel>
          <Select
            labelId="color-label"
            label="Color"
            name="color"
            defaultValue=""
            required
          >
            {colors.map(({ name, hex }) => (
              <MenuItem key={name} value={name}>
                <Chip label={name} style={{ background: hex }} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <div>
          <Typography id="gym-grade-label" gutterBottom>
            Gym grade
          </Typography>

          <Slider
            aria-labelledby="gym-grade-label"
            name="gym_grade"
            marks
            min={1}
            max={8}
            defaultValue={4}
            valueLabelDisplay="on"
            track={false}
          />
        </div>

        <FormControl fullWidth>
          <InputLabel id="hold-type-label">Hold type</InputLabel>
          <Select
            labelId="hold-type-label"
            label="Hold type"
            name="hold_type"
            defaultValue=""
          >
            {holdTypes.map((h) => (
              <MenuItem key={h} value={h}>
                {h}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <LoadingButton
          type="submit"
          variant="contained"
          loading={state === 'submitting'}
        >
          Save
        </LoadingButton>
      </Stack>
    </RemixForm>
  )
}
