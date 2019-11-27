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
          <em>{{baseInfo.time}}</em>
        </el-col>
      </el-row>
      <br>
      <el-row :gutter="20">
        <el-col :span="8">
          <span class="rowLabel">来源机构：</span>
          <em>{{baseInfo.origin}}</em>
        </el-col>
        <el-col :span="8">
          <span class="rowLabel">设备编号：</span>
          <em>{{baseInfo.deviceNum}}</em>
        </el-col>
      </el-row>
      <br>
      <el-button type="primary" @click="dispatchDoctor">调度医生</el-button>
      <el-button type="primary" @click="asDoctor" v-show="doubleRole">作为医生接诊</el-button>
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
      <el-form ref="form" :model="patientFrom" label-width="80px">
        <el-form-item label="病情描述">
          <div class="conditionDesc">
            <div class='desCard' style="border-right: 1px dashed #cdcdcd;">
             <p>已选择：</p>
               <el-tag
                   closable
                   v-for="item in selectTags"
                   :key="item.id"
                   @close='deleteSelect(item)'
                   >
                   {{ item.labelName }}
               </el-tag>
            </div>
            <div :span='12' class='desCard'>
              <p>全部标签：</p>
                <el-tag
                    v-for="item in allTags"
                    :key="item.id"
                     @click='selectAllTags(item)'
                    >
                    {{ item.labelName }}
                </el-tag>
            </div>
          </div>
         <!-- <el-input type="textarea" rows="6" v-model="patientFrom.desc"></el-input> -->
        </el-form-item>
        <el-form-item label="调度建议">
          <el-input type="textarea" rows="6" v-model="patientFrom.proposal"></el-input>
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
  import { getPatientInfo, conditionLabel, updateInquirySheet } from "@/api/dispatch";
  export default{
    data(){
      return{
        hasSelect:false,
        baseInfo:{
          id:'1002010231',
          status:'待调度',
          time:'2019-03-31 09:04:12',
          origin:'新疆阿勒泰中心项目',
          deviceNum:'Usyushe112'
        },
        patient:{
          name:'张三',
          sex:'男',
          ages:'43'
        },
        patientFrom:{
          desc:'',
          proposal:''
        },
        //所有病情描述标签
        allTags:[],
        //已选择病情描述标签
        selectTags:[],
        userRole:null, //用户角色
        doubleRole:false,
      }
    },
    methods:{
      //提交
      onSubmit(){
        //处理病情描述信息
        if(this.selectTags.length == 0){
          this.$message({
            message: '请选择病情描述标签！',
            type: 'warning'
          });
        }else{
          let desStr = ''
          for(var i=0;i<this.selectTags.length;i++){
            desStr += this.selectTags[i].labelName+' '
          }
          const params = {
            inquirySheetId:eval('(' + this.$store.state.user.sysmsg.content + ')')['inquirySheetId'],
            describeIllness:desStr,
            dispatchSuggestion:this.patientFrom.proposal,
          }
          //console.log(params)
          updateInquirySheet(params).then(res => {
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
      //调度医生
      dispatchDoctor(){
        this.$router.push("/dispatch/dispatchDoctor")
      },
      //获取患者信息
      //患者卡片读取患者基本信息
      getInfo(){
        const params = {
          inquirySheetId:eval('(' + this.$store.state.user.sysmsg.content + ')')['inquirySheetId']
        }
        console.log(params)
        getPatientInfo(params).then(res => {
          if(res.data.data){
           // console.log(res.data)
            this.baseInfo = {
              'id':res.data.data.inquirySheetId,
              'time':res.data.data.gmtCreate,
              'origin':res.data.data.orgDisplayName,
              'deviceNum':res.data.data.deviceSn
            };
            // 处理接诊状态  1-已申请、2-已调度、3-待接诊、4-已接诊、5-已完成
            if(res.data.data.status==1){
              this.baseInfo.status = '已申请'
            }else if(res.data.data.status==2){
              this.baseInfo.status = '已调度'
            }else if(res.data.data.status==3){
              this.baseInfo.status = '待接诊'
            }else if(res.data.data.status==4){
              this.baseInfo.status = '已接诊'
            }else if(res.data.data.status==5){
              this.baseInfo.status = '已完成'
            }
            this.patient = {
              'name':res.data.data.userName,
              'ages':res.data.data.age,
              'sex':''
            }
            if(res.data.data.gender == 0){
              this.patient.sex = '男'
            }else if(res.data.data.gender == 1){
               this.patient.sex = '女'
            }else if(res.data.data.gender == 2){
               this.patient.sex = '其他'
            }

          }
        })
      },
      //获取病情描述标签
      getConditionLabel(){
        const params = {
          labelName:'', //标签名称
          page:'', //当前页面
          limit:'' //每页条数
        }
        conditionLabel(params).then(res => {
          console.log(res)
          if(res.data.data){
            for(var i=0;i<res.data.data.length;i++){
              this.allTags.push({
                'id':res.data.data[i].id,
                'labelName':res.data.data[i].labelName
              })
            }
          }
        })
      },
      //点击全部病情描述标签
      selectAllTags(val){
        //console.log(val)
        this.selectTags.push(val)

      },
      //移除选择的病情描述标签
      deleteSelect(val){
        var newData = this.selectTags.filter(function(item){
          return item != val
        })
        this.selectTags = newData
        console.log(newData)
      },
      //若user即为调度 又为医生  则存在作为医生接诊按钮
      asDoctor(){
        this.$router.push('/doctor/admission')
      }
    },
    mounted() {
      this.getInfo();
      this.getConditionLabel();
      console.log( this.$store.state.user.sysmsg )
      this.userRole = this.$store.state.user.userInfo.userType //0为调度  1为医生  2医生、调度
      if( this.userRole ==2 ){
        this.doubleRole = true
      }else{
        this.doubleRole = false
      }
      const oWidth = document.body.clientWidth;
      const oHeight = document.body.clientHeight;
      const { href } = this.$router.resolve({
          name: 'dispatchVideo'
      });
      window.open(href,"_blank",'toolbar=no, width=600, height=600,top='+(oHeight-550)+',left='+(oWidth-550)+'');
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
.conditionDesc{
  height: 200px;
  width: 80%;
  border: 1px solid #DCDFE6;
  border-radius:4px;
  box-sizing: border-box;
  margin-left: 0;
}
.desCard{
  padding: 5px 15px;
  box-sizing: border-box;
  width: 50%;
  float: left;
  min-height: 100%;
  overflow-y: auto;
}
.desCard p{
  font-size: 14px;
  color: #666;
  line-height: 32px;
}
.unselected{
  background: transparent;
}
.selected{
  background: #409eff;
  color: #fff;
}
.el-tag{
  margin: 0 5px 5px 0;
  cursor: pointer;
}
</style>
