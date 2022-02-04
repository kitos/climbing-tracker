let cdnRoot = 'https://ik.imagekit.io/kitos'

export let trImg = (src: string, transformations: { h?: number; w?: number }) =>
  src.replace(
    cdnRoot,
    `${cdnRoot}/tr:${Object.entries(transformations)
      .map(([name, value]) => `${name}-${value}`)
      .join(',')}`
  )
