<template>
  <div>
    <el-card>
      <el-row :gutter="20">
        <el-col :span="4">
          <img :src="doctorImgUrl" alt="" style="display: inline-block;width: 50%;">
          <br>
          <el-radio-group
            v-model="data.statusRadio"
            @change="updateLineStatus"
            style="margin-top: 10px;"
          >
            <el-radio :label="0">在线</el-radio>
            <el-radio :label="2">离开</el-radio>
          </el-radio-group>
        </el-col>
        <el-col :span="18">
          <el-row>
            <el-col :span="8">
              医院：
              <span class="colorStyle">{{data.sourceOrg}}</span>
            </el-col>
            <el-col :span="8">
              角色：
              <span class="colorStyle">{{data.userType}}</span>
            </el-col>
            <el-col :span="8">
              <span v-if="doctor">医生</span>
              <span v-else>调度</span>编号：
              <span class="colorStyle">{{data.userId}}</span>
            </el-col>
          </el-row>
          <br>
          <el-row>
            <el-col :span="8">
              姓名：
              <span class="colorStyle">{{data.userName}}</span>
            </el-col>
            <el-col v-if="doctor" :span="8">
              最后登陆时间：
              <span class="colorStyle">{{data.lastLoginTime}}</span>
            </el-col>
          </el-row>
          <br>
          <el-row v-if="!doctor">
            <el-col :span="14">
              调度机构：
              <el-select v-model="hospitalVal" placeholder="请选择" @change="handleCommand">
                <el-option
                  v-for="item in orgList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-col>
          </el-row>
        </el-col>
      </el-row>
      <br>
      <p v-show="showCard" class="line"></p>
      <p v-show="showCard">待调度</p>
      <ol v-show="showCard">
        <li>
          <span class="status">请求接入</span>
          <p>患者：{{patientInfo.name}}</p>
          <p>性别：{{patientInfo.sex}}</p>
          <p>年龄：{{patientInfo.age}}</p>
          <el-button type="primary" @click="toCnnect">立即接入</el-button>
        </li>
      </ol>
    </el-card>
    <br>
  </div>
</template>

<script>
import Cookies from "js-cookie";
import { getOrgList, updateTargetOrg, getPatientInfo } from "@/api/dispatch";
import { updateLoginStatus } from "@/api/login";
import _global from "@/components/Global";
import { close, truncate, constants } from "fs";
import { debuglog } from "util";
import DoctorImgUrl from '@/assets/user/doctorImg.png'
export default {
  data() {
    return {
      doctorImgUrl:DoctorImgUrl,
      data: {
        headerUrl: "",
        statusRadio: 0,
        userName: "",
        userType: "",
        userId: "",
        lastLoginTime: "",
        sourceOrg: "",
        sourceOrgId: 0
      },
      patientInfo:{
        "name":'',
        'age':'',
        'sex':''
      },
      doctor: false,
      lineStatus: 0,
      hospitalVal: 1,
      orgList: [],
      showCard: false,
      sysmsg: null,
      timer: null,
      hasVideoWindows: true
    };
  },
  created() {
    this.userInfo();

    //加载调度机构列表
    this.getOrgList_();
  },
  methods: {
    updateLineStatus(val) {
      let userInfo = this.$store.state.user.userInfo;
      _global
        .updateLineStatus(val, userInfo)
        .then(res => {
          debugger
          if (res.code == 1) {

            this.msg(res.msg, true);
          } else {
            this.lineStatus = this.lineStatus == 2 ? 0 : 2;
            Cookies.set("userInfo",res.data)
            this.$store.commit('user/SET_USERINFO',res.data)
            this.msg(res.msg);
          }
        })
        .catch(err => {
          // 由网络或者服务器抛出的错误
          this.msg(res.msg, true);
        });
    },
    msg(msg, state) {
      let vm = this;
      vm.$message({
        dangerouslyUseHTMLString: true,
        message: msg,
        type: state ? "warning" : "success",
        duration: 2000,
        onClose: function() {
          if (state) {
            vm.data.statusRadio = vm.lineStatus;
          }
        }
      });
    },
    userInfo() {
      // todo 角色
      let userInfo = this.$store.state.user.userInfo;
      const userType = userInfo.userType;
      let userTypeStr = "";
      if (userType == 1) {
        userTypeStr = "医生";
      } else if (userType == 0) {
        userTypeStr = "调度";
      } else {
        userTypeStr = "调度 | 医生";
      }
      this.data.userType = userTypeStr;
      this.data.userName = userInfo.userName;
      this.data.statusRadio = userInfo.userStatus;
      this.lineStatus = userInfo.userStatus;
      this.doctor = userType == 1 ? true : false;
      this.data.sourceOrg = userInfo.orgDisplayName;
      this.data.lastLoginTime = userInfo.lastLoginTime;
      this.data.sourceOrgId = userInfo.orgId;
      this.hospitalVal = userInfo.targetOrgId;
      this.data.userId = userInfo.userId;
    },
    getOrgList_() {
      const vm = this;
      _global
        .getOrgList_()
        .then(res => {
         // console.log(res);
          if (res.code == 0) {
            this.orgList = res.data;
          } else {
            this.$message({
              message: res.msg,
              type: "warning",
              duration: 2000
            });
          }
        })
        .catch(err => {
          vm.$message({
            message: err,
            type: "warning",
            duration: 2000
          });
        });
    },
    //立即连线
    toCnnect() {
      var audioPlay = document.getElementById("audio");
      audioPlay.pause();
      this.$router.push("/dispatch/connectPatient");
    },
    //更新调度机构
    handleCommand(data) {
      let params = {
        sourceOrgId: this.data.sourceOrgId,
        targetOrgId: data
      };
      updateTargetOrg(params).then(res => {
        let result = res.data;
        if (result.data) {
          this.$message({
            message: "更新调度机构成功",
            type: "success"
          });
          let userInfo = JSON.parse(Cookies.get("userInfo"));
          userInfo.targetOrgId = data;
          Cookies.set("userInfo", userInfo);
        } else {
          this.$alert("更新调度机构失败", "提示", {
            confirmButtonText: "确定",
            callback: action => {
              this.hospitalVal = this.sourceOrgId;
            }
          });
        }
      });
    },
    /* ===================视频   接收到系统消息后===================*/
    handleVideo() {
      this.sysmsg = Cookies.get("sysmsg");
      if (this.sysmsg) {
        window.clearInterval(this.timer);
        this.timer = null;
        this.showCard = true;
      }
    },
    //患者卡片读取患者基本信息
    getInfo(){
      const params = {
        inquirySheetId:eval('(' + this.$store.state.user.sysmsg.content + ')')['inquirySheetId']
      }
      console.log(params)
      getPatientInfo(params).then(res => {
        if(res){

         // debugger

         // console.log(res)

          this.patientInfo = {
            name:res.data.data.userName,
            age:res.data.data.age,
            sex:''  // gender  0-男 1-女 2-其他
          }
          if(res.data.data.gender == 0){
            this.patientInfo.sex = '男'
          }else if(res.data.data.gender == 1){
             this.patientInfo.sex = '女'
          }else if(res.data.data.gender == 2){
             this.patientInfo.sex = '其他'
          }
        }
      })
    }
  },
  mounted() {
    console.log( "vuex中存储的user信息-------------------------" )
    console.log( this.$store.state.user)
    if( Cookies.get('sysmsg') ){
      this.showCard = true;
      this.getInfo();
    }else{
      this.showCard = false;
    }
    // /* ==============================================视频===start=====================================================*/
    //判断是否已经收到系统消息
    this.timer = window.setInterval(() => {
      setTimeout(this.handleVideo(), 0);
    }, 1000);
  }
};
</script>

<style scoped="scoped">
.on-line-status {
  color: green;
  font-weight: 700;
}
.off-line-status {
  color: red;
  font-weight: 700;
}
.colorStyle {
  color: #5da45d;
}
.line {
  margin: 10px 0;
  border-top: 1px solid #cdcdcd;
}
ol {
  overflow: hidden;
  margin-top: 20px;
}
ol li {
  list-style: none;
  padding: 10px;
  border-radius: 5px;
  margin: 0 20px 20px 0;
  float: left;
  border: 1px dashed #cdcdcd;
  position: relative;
  box-sizing: border-box;
  width: 200px;
}
ol li p {
  font: 16px/40px "微软雅黑";
  color: #555;
}
ol li .el-button {
  margin-left: 70px;
}
ol li .status {
  font: 14px/30px "微软雅黑";
  padding: 0 10px;
  position: absolute;
  top: 0;
  right: 0;
  color: #fff;
  background: #999;
}
</style>
