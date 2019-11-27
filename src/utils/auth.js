import Cookies from 'js-cookie'

const TokenKey = 'vue_admin_template_token'

export function getToken() {
  return Cookies.get(TokenKey)
}

export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}
//获取当前操作系统
export function GetOs () {
  let sUserAgent = navigator.userAgent.toLocaleLowerCase()
  let isWin = (navigator.platform === 'win32') || (navigator.platform === 'windows')
  let isMac = (navigator.platform === 'mac68k') || (navigator.platform === 'macppc') || (navigator.platform === 'macintosh') || (navigator.platform === 'macintel')
  var isLinux = (String(navigator.platform).indexOf('linux') > -1)
  if (isLinux) return 'Linux'
  if (isWin) return 'windows'
  return 'others'
}
//获取当前用户的accessToken
export function getAccessToken() {
    return Cookies.get('accesstoken')
}
//获取当前用户的登录状态
// export function getLoginStatus() {
//   return Cookies.get('loginStatus')
// }


//时间戳日期格式化 xxxx-xx-xx
export function dateInit(res){
  var datetime=res.getFullYear() + '-' + (res.getMonth() + 1) + '-' + res.getDate() + ' ' + res.getHours() + ':' + res.getMinutes() + ':' + res.getSeconds();
  return datetime
}
