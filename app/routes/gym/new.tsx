import { useState } from 'react'
import { Form, useTransition } from '@remix-run/react'
import { ActionFunction, LoaderFunction, redirect } from 'remix'
import { Button, InputAdornment, Stack, TextField } from '@mui/material'
import { LoadingButton } from '@mui/lab'
import {
  LocationOnOutlined,
  PublicOutlined,
  UploadFile,
} from '@mui/icons-material'
import { prisma } from '~/prisma'
import { requireUserId } from '~/session.server'
import { Photo } from '~/Photo'
import {
  unstable_createFileUploadHandler as createFileUploadHandler,
  unstable_parseMultipartFormData as parseMultipartFormData,
} from '@remix-run/node'
import { uploadImage } from '../imagekitUploader.server'

export let loader: LoaderFunction = ({ request }) => requireUserId(request)

export let action: ActionFunction = async ({ request }) => {
  let userId = await requireUserId(request)
  let formData = await parseMultipartFormData(
    request,
    createFileUploadHandler({ maxFileSize: Number.MAX_SAFE_INTEGER })
  )
  let logo = formData.get('logo') as any
  let cdnImage = await uploadImage(logo.name, logo.stream())

  await prisma.gym.create({
    data: {
      created_by: { connect: { id: userId } },
      name: formData.get('name') as string,
      address: formData.get('address') as string,
      site: formData.get('site') as string,
      logo: cdnImage.url,
    },
  })

  return redirect('/')
}

export default function NewGym() {
  let { state } = useTransition()
  let [logo, setLogo] = useState<File>()

  return (
    <Stack
      component={Form}
      method="post"
      encType="multipart/form-data"
      spacing={2}
    >
      <Photo file={logo} height={100} />

      <label>
        <input
          onChange={(e) => setLogo(e.target.files?.[0])}
          accept="image/*"
          type="file"
          name="logo"
          hidden
        />

        <Button variant="contained" startIcon={<UploadFile />} component="span">
          Upload logo
        </Button>
      </label>

      <TextField label="Name" name="name" required />
      <TextField
        label="Address"
        name="address"
        required
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <LocationOnOutlined />
            </InputAdornment>
          ),
        }}
      />
      <TextField
        label="Site"
        name="site"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <PublicOutlined />
            </InputAdornment>
          ),
        }}
      />

      <LoadingButton
        variant="contained"
        type="submit"
        loading={state === 'submitting'}
      >
        Create Gym
      </LoadingButton>
    </Stack>
  )
}
