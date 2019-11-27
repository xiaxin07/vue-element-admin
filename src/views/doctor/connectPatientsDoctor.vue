<template>
  <div>
    <el-card style="padding-bottom: 30px;">
      <div class="cardTitle">基本信息：</div>
      <el-row :gutter="20">
        <el-col :span="8">
          <span class="rowLabel">接诊单编号：</span>
          <em>{{baseInfo.id}}</em>
        </el-col>
        <el-col :span="8">
          <span class="rowLabel">接诊状态：</span>
          <em>{{baseInfo.status}}</em>
        </el-col>
        <el-col :span="8">
          <span class="rowLabel">申请时间：</span>
          <em>{{baseInfo.id}}</em>
        </el-col>
      </el-row>
      <br>
      <el-row :gutter="20">
        <el-col :span="8">
          <span class="rowLabel">设备编号：</span>
          <em>{{baseInfo.deviceNum}}</em>
        </el-col>
        <el-col :span="8">
          <span class="rowLabel">调度机构：</span>
          <em>{{baseInfo.dispatchOrgan}}</em>
        </el-col>
        <el-col :span="8">
          <span class="rowLabel">调度人：</span>
          <em>{{baseInfo.dispatcher}}</em>
        </el-col>
      </el-row>
      <br>
      <el-row :gutter="20">
        <el-col :span="8">
          <span class="rowLabel">调度时间：</span>
          <em>{{baseInfo.dispatchTime}}</em>
        </el-col>
      </el-row>
      <br>
    </el-card>
    <br>
    <el-card>
      <div class="cardTitle">患者信息：</div>
      <el-row :gutter="20">
        <el-col :span="6">
          <span class="rowLabel">患者：</span>
          <em>{{patient.name}}</em>
        </el-col>
        <el-col :span="6">
          <span class="rowLabel">性别：</span>
          <em>{{patient.sex}}</em>
        </el-col>
        <el-col :span="6">
          <span class="rowLabel">年龄：</span>
          <em>{{patient.ages}}</em>
        </el-col>
      </el-row>
      <br>
      <el-row :gutter="20" style="background: #f8f8f8;padding: 20px;">
        <el-col :span="12">
          <div class="patientInfo"><span>病情描述：</span>{{patient.desc}}</div>
        </el-col>
        <el-col :span="12">
          <div class="patientInfo">
            <span>调度建议：</span>{{patient.dispatchAdvise}}
          </div>
        </el-col>
      </el-row>
    </el-card>
    <el-card>
      <div class="cardTitle">医生意见：</div>
      <el-form ref="form" :model="doctorAdvice" label-width="80px">
        <el-form-item label="诊断">
          <el-input type="textarea" rows="6" v-model="doctorAdvice.diagnosis"></el-input>
        </el-form-item>
        <el-form-item label="处理意见">
          <el-input type="textarea" rows="6" v-model="doctorAdvice.advice"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit">提交</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
  import Cookies from "js-cookie";
  import { getInquirySheetList, upDateInquirySheet } from '@/api/doctor'
  export default{
    data(){
      return{
        baseInfo:{
          id:'',
          status:'',
          time:'',
          origin:'',
          deviceNum:'',
          dispatchOrgan:'',
          dispatcher:'',
          dispatchTime:''
        },
        patient:{
          name:'',
          sex:'',
          ages:'',
          desc:'',
          dispatchAdvise:''
        },
        doctorAdvice:{
          diagnosis:'',
          advice:''
        },
        doctorId:null
      }
    },
    methods:{
      //提交
      onSubmit(){
        console.log(111)
        if(this.doctorAdvice.diagnosis == ''){
          this.$message({
            message: '请填写诊断信息！',
            type: 'warning'
          });
        }else{
          const params = {
            inquirySheetId:eval('(' + this.$store.state.user.sysmsg.content + ')')['inquirySheetId'],
            diagnosis:this.doctorAdvice.diagnosis,
            advice:this.doctorAdvice.advice,
            doctorId:this.doctorId
          }
          upDateInquirySheet(params).then(res => {
            console.log(res)
            if(res){
              if(res.data.data){
                this.$message({
                  message: '提交成功！',
                  type: 'success'
                });
              }else{
                this.$message({
                  message: '提交异常！',
                  type: 'success'
                });
              }
            }
          })
        }

      },
      //渲染基本信息
      getBaseInfo(){
        const params = {
          inquirySheetId:eval('(' + this.$store.state.user.sysmsg.content + ')')['inquirySheetId']
        }
        getInquirySheetList(params).then(res => {
          console.log(res)
          if(res.data.data){
            const data = res.data.data[0];
            //基本信息
            this.baseInfo = {
              id:data.inquirySheetId,
              time:data.gmtCreate,
              origin:data.orgName,
              deviceNum:data.deviceSn,
              dispatchOrgan:data.orgDisplayName,
              dispatcher:data.dispatcherName,
              dispatchTime:data.gmtModified
            }
            //处理接诊状态
            if(data.status == 1){
              this.baseInfo.status = "已申请"
            }else if(data.status == 2){
              this.baseInfo.status = "已调度"
            }else if(data.status == 3){
              this.baseInfo.status = "待接诊"
            }else if(data.status == 4){
              this.baseInfo.status = "已接诊"
            }else if(data.status == 5){
              this.baseInfo.status = "已完成"
            }
            //患者信息
            this.patient = {
              name:data.userName,
              ages:data.age,
              desc:data.describeIllness,
              dispatchAdvise:data.advice
            }
            //处理患者性别
            if(data.gender == 0){
              this.patient.sex == '男'
            }else if(data.gender == 1){
              this.patient.sex == '女'
            }else if(data.gender == 2){
               this.patient.sex == '其他'
            }
            this.doctorId = data.doctorId

          }
        })
      }
    },
    mounted() {
      //收到系统消息  弹出视频框
      console.log("------------弹窗----------------------")
      console.log( this.$store.state.user.sysmsg )
      this.getBaseInfo()
      //if( Cookies.get('sysmsgDoctor') ){
        const oWidth = document.body.clientWidth;
        const oHeight = document.body.clientHeight;
        const { href } = this.$router.resolve({
            name: 'doctorVideo'
        });
        window.open(href,"_blank",'toolbar=no, width=600, height=600,top='+(oHeight-550)+',left='+(oWidth-550)+'');

      //}
    }
  }
</script>

<style scoped="scoped">
.rowLabel{
  display: inline-block;
  min-width: 100px;
  text-align: right;
  margin-right: 15px;
}
.el-textarea{
  width: 80%;

}
.patientInfo{
  border: 1px solid #cdcdcd;
  border-radius: 3px;
  padding: 20px;
  height: 150px;
  overflow-y: auto;
 }
 .patientInfo span{
   color: #999;
 }
</style>
