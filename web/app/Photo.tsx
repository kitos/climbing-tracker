export let Photo = ({ file, height = 200 }: { file?: File; height?: number }) =>
  file ? (
    <img
      src={URL.createObjectURL(file)}
      alt={file.name}
      style={{ height, objectFit: 'scale-down' }}
    />
  ) : (
    <div style={{ height, background: 'lightgray' }} />
  )
