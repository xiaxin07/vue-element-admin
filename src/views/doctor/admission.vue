<template>
  <div>
    <el-card>
      <el-row :gutter="20">
        <el-col :span="3">
          <img :src="doctorImgUrl" alt="" style="display: inline-block;width: 50%;">
          <el-radio-group
            v-model="data.statusRadio"
            @change="updateLineStatus"
            style="margin-top: 10px;">
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
              最后接诊：
              <span class="colorStyle">{{data.lastLoginTime}}</span>
            </el-col>
          </el-row>
        </el-col>
      </el-row>
      <br>
      <p class="line"></p>
      <p v-show="hiddenDom">待调度</p>
      <ol v-show="hiddenDom">
        <li v-for="data in toConnectData" :key="data.inquirySheetId">
          <span class="status">请求接入</span>
          <p>患者：{{data.userName}}</p>
          <p>性别：{{data.gender}}</p>
          <p>年龄：{{data.age}}</p>
          <div class="desc">
            <p>患者病情描述：</p>
            <p>{{data.describeIllness}}</p>
          </div>
          <el-button @click="toCnnect">立即连线</el-button>
        </li>
      </ol>
    </el-card>
    <br>
    <admissionTable></admissionTable>
  </div>
</template>

<script>
import Cookies from "js-cookie";
import admissionTable from "./admission_table";
import { updateLoginStatus } from "@/api/login";
import { getInquirySheetList } from "@/api/doctor";
import _global from "@/components/Global";
import DoctorImgUrl from '@/assets/user/doctorImg.png'
export default {
  components: {
    admissionTable
  },
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
      doctor: false,
      lineStatus: 0,
      toConnectData: [],
      hiddenDom: false
    };
  },
  created() {
    this.userInfo();
    this.getSchedulingData();
  },
  methods: {
    updateLineStatus(val) {
      let userInfo = this.$store.state.user.userInfo;
      _global
        .updateLineStatus(val, userInfo)
        .then(res => {
          debugger;
          if (res.code == 1) {
            this.msg(res.msg, true);
          } else {
            this.lineStatus = this.lineStatus == 2 ? 0 : 2;
            Cookies.set("userInfo", res.data);
            this.$store.commit("user/SET_USERINFO", res.data);
            this.msg(res.msg);
          }
        })
        .catch(err => {
          // 由网络或者服务器抛出的错误
          this.msg(res.msg, true);
        });
    },
    userInfo() {
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
    getSchedulingData() {},
    //立即连线
    toCnnect() {
      var audioPlay = document.getElementById("audio");
      audioPlay.pause();
      this.$router.push("/doctor/connectPatientsDoctor");
    },
    /* ===================视频   接收到系统消息后===================*/
    handleVideo() {
      //this.sysmsg = Cookies.get("sysmsgDoctor");
      this.sysmsg = Cookies.get("sysmsg")
      //console.log( this.$store.state.user.sysmsg )
      if (this.sysmsg) {
        window.clearInterval(this.timer);
        this.timer = null;
        this.hiddenDom = true;
        this.getPatientInfo();
      }
    },
    //读取患者卡片信息
    getPatientInfo(){
      const params = {
        inquirySheetId:eval('(' + this.$store.state.user.sysmsg.content + ')')['inquirySheetId']
      }
      getInquirySheetList(params).then(res => {
        console.log(res)
        if(res.data.data){
          for(var i=0;i<res.data.data.length;i++){
            if(res.data.data[i].gender == 0 ){  //0男 1女 2其他
              this.toConnectData.push({
                userName:res.data.data[i].userName,
                age:res.data.data[i].age,
                describeIllness:res.data.data[i].describeIllness,
                gender : '男'
              })

            }else if( res.data.data[i].gender == 1 ){
              this.toConnectData.push({
                userName:res.data.data[i].userName,
                age:res.data.data[i].age,
                describeIllness:res.data.data[i].describeIllness,
                gender : '女'
              })
            }else if( res.data.data[i].gender == 2 ){
              this.toConnectData.push({
                userName:res.data.data[i].userName,
                age:res.data.data[i].age,
                describeIllness:res.data.data[i].describeIllness,
                gender : '其他'
              })
            }
          }

        }
      })
    }
  },
  mounted() {
  	if( Cookies.get('sysmsg') ){
      this.hiddenDom = true;
     // this.getPatientInfo();
    }else{
      this.hiddenDom = false;
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
.desc {
  border-top: 1px solid #cdcdcd;
}
</style>
