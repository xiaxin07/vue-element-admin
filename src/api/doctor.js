import request from '@/utils/request'

// 医生操作台 已完成列表    会诊单页面读取患者信息
export function getInquirySheetList(params) {
  return request({
    baseURL: '',
    url: 'api/gfh/inquirySheet/getInquirySheetList.json',
    method: 'post',
    params
  })
}
// 医生列表
export function getDoctorList(params) {
  return request({
    baseURL: '',
    url: 'api/gfh/doctor/getDoctorList.json',
    method: 'post',
    params
  })
}
// 医生诊断
export function updateInquirySheet(params) {
  return request({
    baseURL: '',
    url: 'api/gfh/inquirySheet/updateInquirySheet.json',
    method: 'post',
    params
  })
}
//更新会诊单
export function upDateInquirySheet(params) {
  return request({
    baseURL: '',
    url: 'api/gfh/inquirySheet/updateInquirySheet.json',
    method: 'post',
    params
  })
}
//更新医生状态
export function updateDoctor(params) {
  return request({
    baseURL: '',
    url: 'api/gfh/doctor/updateDoctor.json',
    method: 'post',
    params
  })
}