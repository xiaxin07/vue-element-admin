<template>
  <div class="app-container">
    <el-card>
      <el-form :inline="true" :model="dispatchForm" class="demo-form-inline">
        <el-form-item label="科室">
          <!-- <el-select v-model="dispatchForm.doctorDepartment" placeholder="科室">
            <template v-for="item in departmentOption">
              <el-option :label="item.label" :value="item.value"></el-option>
            </template>
          </el-select> -->
          <el-input v-model="dispatchForm.doctorDepartment" placeholder="科室"></el-input>
        </el-form-item>
        <el-form-item label="医院">
          <el-select v-model="dispatchForm.orgId" placeholder="医院">
            <template v-for="item in orgList">
              <el-option :label="item.label" :value="item.value" :key="item.value"></el-option>
            </template>
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="dispatchForm.doctorStatus" placeholder="状态">
            <template v-for="item in statusOption">
              <el-option :label="item.label" :value="item.value" :key="item.value"></el-option>
            </template>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit">查询</el-button>
        </el-form-item>
      </el-form>
      <br>

      <el-row :gutter="20">
        <template v-for="item in doctorData">
          <el-col :span="8" style="margin-bottom: 20px;" :key="item.accid">
            <div class="doctorContainer">
              <div class="containertop">
                <el-row :gutter="20">
                  <el-col :span="8">
                    <dl>
                      <dt>
                        <!-- <el-image
                          style="width: 100%; height: 80px;margin-bottom: 10px;"
                          :src="item.headImg"
                          fit="fill"
                        ></el-image> -->
                      </dt>
                      <dd style="text-align: center;">{{item.status}}</dd>
                    </dl>
                  </el-col>
                  <el-col :span="16">
                    <p>
                      <em style="font-weight: bold;">{{item.doctorName}}</em>
                      <span>{{ item.doctorLevel }}</span>
                    </p>
                    <p>
                      <em>{{item.doctorDepartment}}</em>
                      <span>{{item.orgDisplayName}}</span>
                    </p>
                    <p>
                      <i class="label">擅长：</i>
                      {{item.speciality}}
                    </p>
                  </el-col>
                </el-row>
              </div>
              <p class="btmTxt">
                <i class="label">最后接诊时间:</i>
                {{item.lastWorkTime}}
              </p>
              <p class="btmTxt btmDesc">
                <i class="label">个人介绍:</i>
                {{item.personalProfile}}
              </p>

              <br>
              <el-button type="primary" round @click="connectDoctor(item)">连线</el-button>
            </div>
          </el-col>
        </template>
      </el-row>
      <br>
      <div style="overflow: hidden;"></div>
    </el-card>
  </div>
</template>

<script>
import Cookies from "js-cookie";
import { getDoctorList } from "@/api/doctor";
import { getOrgList } from "@/api/dispatch"
import _global from "@/components/Global";
import { debuglog } from 'util';
export default {
  data() {
    return {
      dispatchForm: {
        doctorDepartment: "",
        orgId: "",
        doctorStatus: 0
      },
      //医院
      orgList: [],
      //状态
      statusOption: [
        {
          label: "有空",
          value: 0
        },
        {
          label: "忙线",
          value: 1
        }
      ],
      //医生
      doctorData: []
    };
  },
  created() {
    // 默认调度机构
    this.dispatchForm.orgId = JSON.parse(Cookies.get("userInfo")).targetOrgId
    // 加载医院列表
    this.getOrgList_()
    // 加载医生
    this.onSubmit()
  },
  methods: {
    onSubmit() {

      let params = {
        doctorDepartment: this.dispatchForm.doctorDepartment.trim(),
        orgId: this.dispatchForm.orgId,
        doctorStatus: this.dispatchForm.doctorStatus
      }

      let vm = this

      getDoctorList(params).then(res=>{
        if(res.data.code == 0){
          this.doctorData = res.data.data
          let arr = this.doctorData
          for(let index in arr){
            let doctor = arr[index]
            doctor.doctorLevel = _global.doctorLevelMap.get(doctor.doctorLevel)
            doctor.headImg = ''
          }
        }else{
           vm.$message({
            message: '加载医生列表出现异常',
            type: 'warning',
            duration:2000
          });
        }
      }).catch(function (error) {
         // 由网络或者服务器抛出的错误
         vm.$message({
            message: '加载医生列表出现异常',
            type: 'warning',
            duration:2000
          });
      });
    },
    getOrgList_(){
      const vm = this
      _global.getOrgList_().then(res=>{
        console.log(res)
        if(res.code == 0){
          this.orgList = res.data
        }else{
          this.$message({
            message: '加载医院列表异常',
            type: 'warning',
            duration:2000
          });
        }
      }).catch(err=>{
        vm.$message({
            message: '加载医院列表异常',
            type: 'warning',
            duration:2000
        });
      })
    },
    //连线医生
    connectDoctor(val){
      console.log( this.nimInit)
      let that = this;
      console.log(val)
      console.log( this.$store.state.user.sysmsg )
      SDK.NIM.use(WebRTC);
      console.log( "accid========"+  that.$store.state.user.userInfo.accid)
      console.log( "token========"+  that.$store.state.user.userInfo.neteaseToken)
      var nim = SDK.NIM.getInstance({
          debug: true,
          "account": that.$store.state.user.userInfo.accid,
          "appKey": "ccca389251438bedb20f29c4994f2dba",
          "token":  that.$store.state.user.userInfo.neteaseToken,
          onconnect: onconnect,
          ondisconnect: ondisconnect,
          onerror: onerror,
      });
      //IM登录成功后初始化音视频实例: WebRTC.getInstance
      var webrtc = WebRTC.getInstance({
          // 是否开启日志打印
          //debug: true,
          nim: nim,
          // container: videoContainer,
          // remoteContainer: remoteContainer
      });
      function onconnect() {
          console.log('SDK 连接成功');
      }

      function ondisconnect() {
          console.log('SDK 连接断开');
      }

      function onerror() {
          console.log('SDK 连接失败', error);
      }
      let content = JSON.parse(that.$store.state.user.sysmsg.content);
      console.log("房间号----------------")
      console.log( content['channelName'] )
      var contentP = {
          channelName: content['channelName'],
          inquirySheetId: content['inquirySheetId'],
      };
      contentP = JSON.stringify(contentP);
      console.log(contentP)
      console.log( val.accid )
      nim.sendCustomSysMsg({
          scene: "p2p", //点对点
          to: val.accid, //调度账号
          content: contentP,
          sendToOnlineUsersOnly: true,
          done: function(error, msg){
            console.log('发送' + msg.scene + ' ' + msg.type + '消息' + (!error ? '成功' : '失败') + ', id=' + msg.idClient, error, msg);
            //webrtc.destroy()
          }
      });
    }
  },
  mounted() {
    /* ======================视频================================*/
     // SDK.NIM.use(WebRTC);
     // var that = this;
     // //初始化SDK
     // var nim = SDK.NIM.getInstance({
     //     //debug: true,
     //     "account": that.$store.state.user.sysmsg.to,
     //     "appKey": "ccca389251438bedb20f29c4994f2dba",
     //     "token": that.$store.state.user.userInfo.neteaseToken,
     //     onconnect: onconnect,
     //     ondisconnect: ondisconnect,
     //     onerror: onerror,
     // });
     // //IM登录成功后初始化音视频实例: WebRTC.getInstance
     // var webrtc = WebRTC.getInstance({
     //     // 是否开启日志打印
     //     //debug: true,
     //     nim: nim,
     //     // container: videoContainer,
     //     // remoteContainer: remoteContainer
     // });
     // function onconnect() {
     //     console.log('SDK 连接成功');
     // }

     // function ondisconnect() {
     //     console.log('SDK 连接断开');
     // }

     // function onerror() {
     //     console.log('SDK 连接失败', error);
     // }
     //发起视频通话
     $(".j-confirm").click(function(val) {
        console.log(val)
     });

  }
};
</script>

<style scoped="scoped">
.doctorContainer {
  border: 1px dashed #cdcdcd;
  padding: 20px 10px;
}
.containertop {
  border-bottom: 1px solid #eee;
  padding-bottom: 20px;
  margin-bottom: 20px;
}
.containertop p {
  margin-bottom: 10px;
  color: #333;
}
.containertop p em {
  margin-right: 10px;
}
.doctorContainer .label {
  color: #999;
  margin-right: 10px;
  font-style: normal;
}
.el-button.is-round {
  padding: 8px 34px;
}
.btmTxt {
  font: 15px/20px "微软雅黑";
  margin-bottom: 10px;
  color: #333;
}
.btmDesc {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  height: 60px;
}
</style>
