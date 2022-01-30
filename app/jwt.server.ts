import jwt from 'jsonwebtoken'
import invariant from '@remix-run/dev/invariant'

invariant(process.env.JWT_SECRET, 'JWT_SECRET is required!')

let secretKey = process.env.JWT_SECRET

interface IMagicJwtPayload {
  magicKey: string
  redirectTo: string
}

export let sign = (payload: IMagicJwtPayload) =>
  new Promise<string>((resolve, reject) =>
    jwt.sign(payload, secretKey, { expiresIn: '10m' }, (error, encoded) =>
      error ? reject(error) : resolve(encoded!)
    )
  )

export let verify = (token: string) =>
  new Promise<IMagicJwtPayload>((resolve, reject) =>
    jwt.verify(token, secretKey, (err, payload) =>
      err ? reject(err) : resolve(payload as IMagicJwtPayload)
    )
  )
