import axios from 'axios'
import { toast } from 'react-toastify'
import { signOutUserAPI } from 'redux/user/userSlice'
import { refreshTokenAPI } from 'actions/ApiCall'

// How can I use the Redux store in non-component files?
// https://redux.js.org/faq/code-structure#how-can-i-use-the-redux-store-in-non-component-files
// Inject store
let store
export const injectStore = _store => {
  store = _store
}


let authorizedAxiosInstance = axios.create()
authorizedAxiosInstance.defaults.timeout = 1000 * 60 * 10 // 10 minutes
authorizedAxiosInstance.defaults.withCredentials = true // Sẽ cho phép axios tự động gửi cookie trong mỗi request lên BE

// Kỹ thuật dùng css pointer-event để chặn user click nhanh tại bất kỳ chỗ nào có hành động click gọi api
// Đây là một kỹ thuật rất hay tận dụng Axios Interceptors và CSS Pointer-event để chỉ phải viết code xử lý một lần cho toàn bộ dự án
// Cách sử dụng: Với tất cả các link hoặc button mà có hành động call api thì thêm class "tqd-send" cho nó là xong.
const updateSendingApiStatus = (sending = true) => {
  const submits = document.querySelectorAll('.tqd-send')
  for (let i = 0; i < submits.length; i++) {
    if (sending) submits[i].classList.add('tqd-waiting')
    else submits[i].classList.remove('tqd-waiting')
  }
}

// https://axios-http.com/docs/interceptors

// Can thiệp vào giữa request gửi đi
authorizedAxiosInstance.interceptors.request.use(function (config) {
  // Do something before request is sent
  updateSendingApiStatus(true)

  return config
}, function (error) {
  // Do something with request error
  return Promise.reject(error)
})


// Khởi tạo một cái promise cho việc gọi api refresh_token
// Mục đích tạo Promise này để khi nào gọi api refresh_token xong xuôi thì mới retry lại các api bị lỗi trước đó.
let refreshTokenPromise = null

// Can thiệp vào giữa response trả về
authorizedAxiosInstance.interceptors.response.use(function (response) {
  // Bất kỳ mã status code nằm trong phạm vi 200 - 299 thì sẽ là success và code chạy vào đây
  // Do something with response data
  updateSendingApiStatus(false)

  return response
}, function (error) {
  // Bất kỳ mã status code nằm ngoài phạm vi 200 - 299 thì sẽ bị coi là error và code chạy vào đây
  // Do something with response error
  updateSendingApiStatus(false)

  // Nếu như nhận mã 401 từ phía BE trả về, gọi api đăng xuất luôn
  if (error.response?.status === 401) {
    store.dispatch(signOutUserAPI(false))
  }

  // Nếu như nhận mã 410 từ phía BE trả về, gọi api refresh_token
  const originalRequests = error.config
  if (error.response?.status === 410 && !originalRequests._retry) {
    originalRequests._retry = true

    // Kiểm tra xem nếu chưa có refreshTokenPromise thì thực hiện gán việc gọi api refresh_token vào cho cái refreshTokenPromise này
    if (!refreshTokenPromise) {
      refreshTokenPromise = refreshTokenAPI()
        .then(data => { return data?.accessToken }) // đồng thời accessToken đã nằm trong httpOnly cookie (xử lý từ phía BE)
        .catch(() => { store.dispatch(signOutUserAPI(false)) }) // Nếu nhận bất kỳ lỗi nào từ api refresh token thì cứ logout luôn
        .finally(() => { refreshTokenPromise = null }) // Xong xuôi hết thì gán lại cái refreshTokenPromise về null
    }

    // eslint-disable-next-line no-unused-vars
    return refreshTokenPromise.then(accessToken => {
      // Hiện tại ở đây không cần dùng gì tới accessToken vì chúng ta đã đưa nó vào cookie (xử lý từ phía BE) khi api được gọi thành công.
      // Trường hợp nếu dự án cần lưu accessToken vào localstorage hoặc đâu đó thì sẽ viết code ở đây.

      // Quan trọng: Return lại axios instance của chúng ta kết hợp các originalRequests để call lại những api ban đầu bị lỗi
      return authorizedAxiosInstance(originalRequests)
    })
  }


  let errorMessage = error?.message
  if (error.response?.data?.errors) {
    errorMessage = error.response?.data?.errors
  }

  if (error.response?.status !== 410) {
    toast.error(errorMessage)
  }

  return Promise.reject(error)
})

export default authorizedAxiosInstance
