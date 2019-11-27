<template>
  <div class="app-container">
    <el-form :inline="true" :model="dispatchForm" class="demo-form-inline">
      <el-form-item label="订单单号">
        <el-input v-model="dispatchForm.inquirySheetId" placeholder="订单单号"></el-input>
      </el-form-item>
      <el-form-item label="用户姓名">
        <el-input v-model="dispatchForm.userName" placeholder="用户姓名"></el-input>
      </el-form-item>
      <el-form-item label="时间范围">
        <!-- <el-input v-model="dispatchForm.rangeTime" placeholder="时间范围"></el-input> -->
        <el-date-picker v-model="rangeTime" type="daterange"  value-format="yyyy-MM-dd" range-separator="至" start-placeholder="开始日期" 
        end-placeholder="结束日期"></el-date-picker>
      </el-form-item>
      <el-form-item label="订单状态">
        <el-select v-model="dispatchForm.status" placeholder="订单状态">
          <el-option v-for="status in statusList" :key="status.value" :label="status.label" :value="status.value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="终端编码">
        <el-input v-model="dispatchForm.deviceSn" placeholder="终端编码"></el-input>
      </el-form-item>
      <el-form-item label="调度给">
        <el-input v-model="dispatchForm.doctorName" placeholder="调度给"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">查询</el-button>
      </el-form-item>
    </el-form>
    <br>
    <!-- element-loading-background="rgba(0, 0, 0, 0.8)"
    element-loading-text="拼命加载中"
     -->

    <el-table
      v-loading="loading"
      
      element-loading-spinner="el-icon-loading"
      
      :data="tableData"
      border
      fit
      highlight-current-row
      @selection-change="handleSelectionChange"
    >
      <el-table-column
        type="selection"
        width="55">
      </el-table-column>
            <!-- :formatter="item.formatter" -->
      <template v-for="item in tableOption">
        <el-table-column
          :key="item.index"
          :type="item.type"
          :prop="item.prop"
          :label='item.label'
          :formatter="item.formatter"
         >
        </el-table-column>
      </template>
    </el-table>
    <br>
    <div style="overflow: hidden;">
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" 
        :current-page.sync="currentPage"
        style='float: right;'
        background
        layout="prev, pager, next"
        :total="count">
      </el-pagination>
    </div>
  </div>
</template>

<script>
import Cookies from 'js-cookie'
import { getList } from '@/api/table'
import { getInquirySheetList } from "@/api/dispatch"
import _global from '@/components/Global'

export default {
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'gray',
        deleted: 'danger'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      statusList:[
        {
          label: "已申请",
          value: 1
        }, 
        {
          label: "已调度",
          value: 2
        }
      ],
      dispatchForm:{
        inquirySheetId:"",
        userName:"",
        startDate:"",
        endDate:"",
        status:2,
        deviceSn:"",
        doctorName:"",
        page:"",
        limit:""
      },
      rangeTime:[],
      tableData:[],
      count: 0,
      tableOption: [
        {
          'prop':'inquirySheetId',
          'label':'订单编号',
          'type':'normal',
          'formatter':_global.formatter
        },{
          'prop':'userName',
          'label':'用户',
          'type':'normal',
          'formatter':_global.formatter
        },{
          'prop':'gender',
          'label':'性别',
          'type':'normal',
          'formatter':_global.formatGender
        },{
          'prop':'age',
          'label':'年龄',
          'type':'normal',
          'formatter':_global.formatter
        },{
          'prop':'gmtModified',
          'label':'调度时间',
          'type':'normal',
          'formatter':_global.formatter
        },{
          'prop':'status',
          'label':'状态',
          'type':'normal',
          'formatter':_global.formatStatus
        },{
          'prop':'deviceSn',
          'label':'终端编码',
          'type':'normal',
          'formatter':_global.formatter
        },{
          'prop':'dispatcherName',
          'label':'调度给/医生',
          'type':'normal',
          'formatter':_global.formatter
        }
      ],
      loading: true,
      currentPage: 1
    }
  },
  created() {
   this.onSubmit()
  },
  methods: {
    onSubmit(){
       this.loading = true
       this.dispatchForm.page = this.currentPage
       this.dispatchForm.limit = 10
      //  console.log(this.dispatchForm)
       if(this.rangeTime.length>0){
         this.dispatchForm.startDate = this.rangeTime[0]
         this.dispatchForm.endDate = this.rangeTime[1]
       }
       let params = JSON.parse(JSON.stringify(this.dispatchForm))
      //  debugger
       params.userName = params.userName.trim()
       params.inquirySheetId = params.inquirySheetId.trim()
       params.deviceSn = params.deviceSn.trim()
       params.doctorName = params.doctorName.trim()
       getInquirySheetList(params).then(res=>{
          let result = res.data
          this.count = res.data.count
          this.tableData = result.data
          this.loading = false
       })
    },
     
    handleSelectionChange( val ){
      this.multipleSelection = val;
      //console.log(val)
    },
    //分页
    handleSizeChange(val) {
      // console.log(`每页 ${val} 条`);
      this.currentPage = val
      this.onSubmit()
    },
    handleCurrentChange(val) {
      this.currentPage = val
      // console.log(`当前页: ${val}`);
      this.onSubmit()
    }
  },
  mounted() {
    console.log(Cookies.get( "userInfo" ) )

    console.log(this.$store.state.user)//1
  }
}
</script>
