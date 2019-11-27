<template>
  <div>
    <el-card>
      <el-form :inline="true" :model="formInline" class="demo-form-inline">
        <el-form-item label="订单单号">
          <el-input v-model="formInline.orderNum" placeholder="订单单号"></el-input>
        </el-form-item>
        <el-form-item label="用户姓名">
          <el-input v-model="formInline.name" placeholder="用户姓名"></el-input>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
                v-model="formInline.time"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="订单状态">
          <el-select v-model="formInline.status" placeholder="订单状态">
            <el-option label="已申请" value="1"></el-option>
            <el-option label="已调度" value="2"></el-option>
            <el-option label="待接诊" value="3"></el-option>
            <el-option label="已接诊" value="4"></el-option>
            <el-option label="已完成" value="5"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit">查询</el-button>
        </el-form-item>
      </el-form>
      <br>
      <!-- 表格-->
      <el-table
          element-loading-text="Loading"
          border
          fit
          highlight-current-row
          ref="multipleTable"
          :data="tableData"
          tooltip-effect="dark"
          style="width: 100%">
          <template v-for="item in columns">
            <el-table-column
              align="center"
              v-if="item.type=='normal'"
              :label="item.label"
              :prop="item.prop"
              :type="item.type">
            </el-table-column>
            <el-table-column align="center" v-if="item.type=='operat'" :label="item.label" :prop="item.prop">
               <template slot-scope="scope">
                    <el-button @click="checkReport(scope.row)" type="text" size="small">诊断报告</el-button>
               </template>
            </el-table-column>
          </template>
        </el-table>
        <!-- 分页 -->
         <br>
         <div style="overflow: hidden;">
           <el-pagination
                 style="float: right;"
                 @size-change="handleSizeChange"
                 @current-change="handleCurrentChange"
                 :current-page="currentPage"
                 :page-sizes="[100, 200, 300, 400]"
                 :page-size="limit"
                 layout="total, sizes, prev, pager, next, jumper"
                 :total="total">
           </el-pagination>
        </div>
    </el-card>
  </div>
</template>

<script>
  import { getInquirySheetList } from '@/api/doctor'
  import { dateInit } from '@/utils/auth'
  export default {
      data() {
        return {
          formInline: {
            orderNum: '',
            name: '',
            time:'',
            status:''
          },
          startDate:'', //开始时间
          endDate:'', //结束时间
          /* 表格*/
          columns:[{
            "prop":"inquirySheetId",
            "label":"订单编号",
            "type":"normal"
          },{
            "prop":"userName",
            "label":"用户",
            "type":"normal"
          },{
            "prop":"",
            "label":"性别",
            "type":"normal"
          },{
            "prop":"age",
            "label":"年龄",
            "type":"normal"
          },{
            "prop":"year",
            "label":"接诊时间",
            "type":"normal"
          },{
            "prop":"status",
            "label":"状态",
            "type":"normal"
          },{
            "prop":"dispatcherName",
            "label":"调度",
            "type":"normal"
          },{
            "prop":'',
            'label':'操作',
            'type':'operat'
          }],
          tableData: [],
          multipleSelection: [],
          currentPage: 1,
          total:0,
          limit:100
        }
      },
      methods: {
        onSubmit() {
          this.startDate = dateInit(this.formInline.time[0])
          this.endDate = dateInit(this.formInline.time[1])
          this.getDataFn()
        },
        //获取列表数据
        getDataFn(){
          const params = {
            inquirySheetId : this.formInline.orderNum,
            userName : this.formInline.name,
            startDate:this.startDate,
            endDate:this.endDate,
            status:this.formInline.status,
            page:this.currentPage,
            // limit:this.limit
          }
          console.log(params)
          getInquirySheetList(params).then(res => {
             if(res){
              console.log(res)
              this.tableData = res.data.data;
              this.total = res.data.count;
             }
          })
        },
        /* 分页*/
        handleSizeChange(val) {
          this.limit = val
          this.getDataFn()
        },
        handleCurrentChange(val) {
          this.currentPage = val
          this.getDataFn()
        },
        //查看诊断报告
        checkReport(val){
          console.log( val )
        }
      },
      mounted() {
        this.getDataFn()
      }
  }
</script>

<style>
</style>
