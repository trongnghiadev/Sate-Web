import { WHITELIST_DOMAINS } from '*/utilities/constants'
import { env } from '*/config/environtment'

export const corsOptions = {
  origin: function (origin, callback) {
    // Hỗ trợ việc gọi API bằng POSTMAN trên môi trường dev, khi sử dụng postman thì cái origin sẽ có giá trị là undefined
    if (!origin && env.BUILD_MODE === 'dev') {
      return callback(null, true)
    }

    if (WHITELIST_DOMAINS.indexOf(origin) !== -1) {
      return callback(null, true)
    }

    return callback(new Error(`${origin} not allowed by CORS.`))
  },
  optionsSuccessStatus: 200,
  credentials: true // CORS sẽ cho phép nhận cookies
}
