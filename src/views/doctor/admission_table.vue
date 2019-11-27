<template>
  <div>
    <el-card>
      <el-form :inline="true" :model="inquirySheet" class="demo-form-inline">
        <el-form-item label="订单单号">
          <el-input v-model="inquirySheet.inquirySheetId" placeholder="订单单号"></el-input>
        </el-form-item>
        <el-form-item label="用户姓名">
          <el-input v-model="inquirySheet.userName" placeholder="用户姓名"></el-input>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker v-model="rangeTime" type="daterange"  value-format="yyyy-MM-dd" range-separator="至" start-placeholder="开始日期" 
        end-placeholder="结束日期"></el-date-picker>
        </el-form-item>
        <el-form-item label="订单状态">
          <el-select v-model="inquirySheet.status" placeholder="订单状态">
            <el-option v-for="status in statusList" :key="status.index" :label="status.label" :value="status.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit">查询</el-button>
        </el-form-item>
      </el-form>
      <br>
      <!-- 表格-->
      <el-table
          ref="multipleTable"
          :data="tableData"
          tooltip-effect="dark"
          style="width: 100%"
          @selection-change="handleSelectionChange">
          <el-table-column
            type="selection"
            width="55">
          </el-table-column>
          <template v-for="item in columns">
            <el-table-column
              v-if="item.type=='normal'"
              :key="item.index"
              :label="item.label"
              :prop="item.prop"
              :type="item.type"
              :formatter="item.formatter"
              >
            </el-table-column>
            <el-table-column v-if="item.type=='operat'" :key="item.prop" :label="item.label" :prop="item.prop">
               <template slot-scope="scope">
                    <el-button @click="deleteRow(scope.row)" type="text" size="small">诊断报告</el-button>
               </template>
            </el-table-column>
          </template>
        </el-table>
        <!-- 分页 -->
         <br>
         <!--  :page-size="100" -->
         <div style="overflow: hidden;">
            <el-pagination
               background
               @size-change="handleSizeChange"
               @current-change="handleCurrentChange"
               :current-page.sync="currentPage"
               layout=" prev, pager, next"
               :total="count"
               style="float: right;">
             </el-pagination>
        </div>
    </el-card>
  </div>
</template>

<script>
  import _global from '@/components/Global'
  import { getInquirySheetList } from "@/api/dispatch"
  export default {
      data() {
        return {
          statusList:[
            {
              label: "待接诊",
              value: 3
            }, 
            {
              label: "已接诊",
              value: 4
            }
          ],
          inquirySheet: {
            inquirySheetId:"",
            userName:"",
            startDate:"",
            endDate:"",
            status:3,
            page:"",
            limit:""
          },
          rangeTime:[],
          /* 表格*/
          columns:[{
            "prop":"inquirySheetId",
            "label":"订单编号",
            "type":"normal",
            'formatter':_global.formatter
          },{
            "prop":"userName",
            "label":"用户",
            "type":"normal",
            'formatter':_global.formatter
          },{
            "prop":"gender",
            "label":"性别",
            "type":"normal",
            'formatter':_global.formatGender
          },{
            "prop":"age",
            "label":"年龄",
            "type":"normal",
            'formatter':_global.formatter
          },{
            "prop":"gmtModified",
            "label":"接诊时间",
            "type":"normal",
            'formatter':_global.formatter
          },{
            "prop":"status",
            "label":"状态",
            "type":"normal",
            'formatter':_global.formatStatus
          },{
            "prop":"dispatcherName",
            "label":"调度",
            "type":"normal",
            'formatter':_global.formatter
          }],
          tableData: [],
          multipleSelection: [],
          currentPage: 1,
          count:100
        }
      },
      created(){
        this.onSubmit()
      },
      methods: {
        onSubmit(){
          this.inquirySheet.page = this.currentPage
          this.inquirySheet.limit = 10
          if(this.rangeTime.length>0){
            this.inquirySheet.startDate = this.rangeTime[0]
            this.inquirySheet.endDate = this.rangeTime[1]
          }
          let params = JSON.parse(JSON.stringify(this.inquirySheet))
          //  debugger
          params.userName = params.userName.trim()
          params.inquirySheetId = params.inquirySheetId.trim()
          // params.status = 1
          // params.deviceSn = params.deviceSn.trim()
          // params.doctorName = params.doctorName.trim()
          getInquirySheetList(params).then(res=>{
              let result = res.data
              this.count = res.data.count
              this.tableData = result.data

          })
        },
        // getData() {
        // 	var that = this
        // 	that.$axios.get('api/movie/top250').then(function(res) {
        // 		that.tableData = res.data.subjects
        // 		//console.log(that.tableData)
        // 	}).catch(function(err) {
        //     console.log(err);
        // 	});
        // },
        //表格内的复选框
        handleSelectionChange(val) {
          this.multipleSelection = val;
          console.log(val)
        },
        /* 分页*/
        handleSizeChange(val) {
          console.log(`每页 ${val} 条`);
           // console.log(`每页 ${val} 条`);
          this.currentPage = val
          this.onSubmit()
        },
        handleCurrentChange(val) {
          console.log(`当前页: ${val}`);
           // console.log(`每页 ${val} 条`);
          this.currentPage = val
          this.onSubmit()
        }
      }
  }
</script>

<style>
</style>
