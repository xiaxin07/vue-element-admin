<script>
import { getOrgList, updateTargetOrg } from "@/api/dispatch";
import { updateLoginStatus } from "@/api/login";
import { Promise } from "q";
import { debuglog } from 'util';
/**
 * 登录用户类型
 */
const doctorLevelMap = new Map();
doctorLevelMap.set(1, "住院医师"); //医生
doctorLevelMap.set(2, "主治医师"); //调度
doctorLevelMap.set(3, "副主任医师"); //调度
doctorLevelMap.set(4, "主任医师"); //调度

const userTypeMap = new Map()
userTypeMap.set(0,'dispatcher')
userTypeMap.set(1,'doctor')
userTypeMap.set(2,'admin')

const orgListErrMsg = "加载调度机构异常！";
const offLineStatus = 2; //离线状态
const resultData = {}
const updateLineStatusErrMsg = "更新状态失败，请重试！"

export default {
  doctorLevelMap,
  offLineStatus,
  orgListErrMsg,
  resultData,
  userTypeMap,
  updateLineStatusErrMsg,
  formatGender(row, column, cellValue) {
    //  console.log(cellValue)
    if (row.gender == "0") {
      return "男";
    } else if (row.gender == "1") {
      return "女";
    } else {
      return " ";
    }
  },
  formatter(row, column, cellValue) {
    // debugger
    return cellValue;
  },
  updateLineStatus(val,userInfo) {
   // debugger;
    const userId = userInfo.userId;

    let params = {
      doctorId: userId,
      doctorStatus: val
    };

    if (userInfo.userType != 1) {
      params = {
        dispatcherId: userId,
        dispatcherStatus: val
      };
    }
    userInfo.userStatus = val;
   
    let message = "您已更新为<strong>离线</strong>状态";
    message=val==0?"您已更新为<strong>在线</strong>状态":message

    return new Promise((resolve, reject) => {
      let resultData = {};
      updateLoginStatus(userInfo.userType, params).then(res => {
          if (res.data) {
            resultData.code = 0
            resultData.msg = message
            resultData.data = userInfo
          } else {
            resultData.code = 1
            resultData.msg = this.updateLineStatusErrMsg
          }
           resolve(resultData)
        }).catch(function(error) {
          reject(this.updateLineStatusErrMsg);
        });
    });
  },
  getOrgList_() {
    return new Promise((resolve, reject) => {
     // debugger
      let resultData = {};
      getOrgList()
        .then(res => {
          const result = res.data;
          if (res.data.code == 0) {
            let list = result.data;
            let commandArr = [];
            for (var x in list) {
              let command = {};
              command.label = list[x].orgDisplayName;
              command.value = list[x].orgId;
              commandArr.push(command);
            }
            resultData.data = commandArr;
            resultData.code = 0;
          } else {
            resultData.msg = this.orgListErrMsg;
            resultData.code = 1;
          }
          resolve(resultData);
        })
        .catch(function(error) {
          reject(this.orgListErrMsg);
        });
    });
  },
  formatStatus(row, column, cellValue) {
    if (row.status == "1") {
      return "已申请";
    } else if (row.status == "2") {
      return "已调度";
    } else if (row.status == "3") {
      return "待接诊";
    } else if (row.status == "4") {
      return "已接诊";
    } else if (row.status == "5") {
      return "已完成";
    } else {
      return " ";
    }
  }
};
</script>

