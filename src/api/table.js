import request from '@/utils/request'

// export function getList(params) {
//   return request({
//     url: '/table/list',
//     method: 'get',
//     params
//   })
// }

export function getList(params) {
  return request({
    baseURL: '',
    url: 'api/gfh/login/getQRCode.json',
    method: 'post',
    params
  })
}
