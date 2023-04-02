import multer from 'multer'

const LIMIT_COMMON_FILE_SIZE = 10485760 // byte = 10 MB
const ALLOW_COMMON_FILE_TYPES = ['image/jpg', 'image/jpeg', 'image/png']

// Kiểm tra loại file nào được chấp nhận
const customFileFilter = (req, file, callback) => {
  if (!ALLOW_COMMON_FILE_TYPES.includes(file.mimetype)) {
    const errMessage = 'File type is invalid'
    return callback(errMessage, null)
  }
  return callback(null, true)
}

const upload = multer({
  limits: { fileSize: LIMIT_COMMON_FILE_SIZE },
  fileFilter: customFileFilter
})

export const UploadMiddleware = {
  upload
}

