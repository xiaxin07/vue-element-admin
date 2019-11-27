import request from '@/utils/request'

// 调度或医生 获取二维码
export function getCode(params) {
  return request({
    baseURL: '',
    url: 'api/gfh/login/getQRCode.json',
    method: 'post',
    params
  })
}
// 获取调度登录状态 status: 0等待登录 1登录成功 2已扫码 -1拒绝登录
export function getLoginStatus(params) {
  return request({
    baseURL: '',
    url: 'api/gfh/login/getLoginStatus.json',
    method: 'post',
    params
  })
}

export function updateLoginStatus(userRole, params) {
  let url = 'api/gfh/doctor/updateDoctor.json'

  if (userRole === 0 || userRole === '0') {
    url = 'api/gfh/dispatcher/updateDispatcher.json'
  }
  return request({
    baseURL: '',
    url: url,
    method: 'post',
    params
  })
}
