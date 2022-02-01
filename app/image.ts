let cdnRoot = 'https://ik.imagekit.io/kitos'

export let trImg = (src: string, size = 100) =>
  src.replace(cdnRoot, `${cdnRoot}/tr:w-${size},h-${size}`)
