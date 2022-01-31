import ImageKit from 'imagekit'
import { ReadStream } from 'fs'

if (!process.env.IMAGEKIT_SECRET) {
  throw 'IMAGEKIT_SECRET is required'
}

let imageKit = new ImageKit({
  publicKey: 'public_xtLq8DfKqyGulv2fIVY2r4Xn3ns=',
  privateKey: process.env.IMAGEKIT_SECRET,
  urlEndpoint: 'https://ik.imagekit.io/kitos',
})

export let uploadImage = async (
  fileName: string,
  file: Buffer | ReadStream | string
) => imageKit.upload({ file, fileName })
