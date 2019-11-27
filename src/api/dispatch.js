import request from '@/utils/request'

// 调度机构 渲染下拉框
export function getOrgList() {
  const url = 'api/gfh/org/getOrgList.json'
  return request({
    baseURL: '',
    url: url,
    method: 'post'
  })
}
// 已调度列表
export function getInquirySheetList(params) {
  return request({
    baseURL: '',
    url: 'api/gfh/inquirySheet/getInquirySheetList.json',
    method: 'post',
    params
  })
}
// 修改调度机构
export function updateTargetOrg(params) {
  return request({
    baseURL: '',
    url: 'api/gfh/dispatcherRules/updateTargetOrg.json',
    method: 'post',
    params
  })
}
//待调度页面 待接入卡片获取患者信息
export function getPatientInfo(params) {
  return request({
    baseURL: '',
    url: 'api/gfh/inquirySheet/getInquirySheet.json',
    method: 'post',
    params
  })
}
//待调度页面  病情描述标签
export function conditionLabel(params) {
  return request({
    baseURL: '',
    url: 'api/gfh/label/getDescribeIllnessLabelList.json',
    method: 'post',
    params
  })
}
//连线患者 更新会诊单 
export function updateInquirySheet(params) {
  return request({
    baseURL: '',
    url: 'api/gfh/inquirySheet/updateInquirySheet.json',
    method: 'post',
    params
  })
}
//更新调度状态 
export function updateDispatcher(params) {
  return request({
    baseURL: '',
    url: 'api/gfh/dispatcher/updateDispatcher.json',
    method: 'post',
    params
  })
}