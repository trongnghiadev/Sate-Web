import JWT from 'jsonwebtoken'

// Tạo mới một token với 3 tham số:
// secretSignature: Chữ ký bí mật (dạng một chuỗi string ngẫu nhiên)
// tokenLife: Thời gian sống của token
// user: Những thông tin muốn đưa vào token
const generateToken = async (secretSignature, tokenLife, user = {}) => {
  try {
    return await JWT.sign(user, secretSignature, { algorithm: 'HS256', expiresIn: tokenLife })
  } catch (error) {
    throw new Error(error)
  }
}

// Kiểm tra một token có hợp lệ hay không
// Hợp lệ ở đây nghĩa là token được tạo ra với đúng cái chữ ký bí mật secretSignature trong dự án
const verifyToken = async (secretSignature, token) => {
  try {
    return await JWT.verify(token, secretSignature)
  } catch (error) {
    throw new Error(error)
  }
}

export const JwtProvider = {
  generateToken,
  verifyToken
}
