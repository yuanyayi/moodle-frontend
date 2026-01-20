<template>
  <div class="student-log-detail">
    <a-card :bordered="false">
      <h3>学生直播日志详情</h3>
      
      <!-- 学生基本信息 -->
      <div class="student-info" v-if="studentInfo">
        <h4>学生基本信息</h4>
        <div class="info-item">
          <span class="label">学生ID：</span>
          <span class="value">{{ studentInfo.student_id }}</span>
        </div>
        <div class="info-item">
          <span class="label">学生名称：</span>
          <span class="value">{{ studentInfo.student_name }}</span>
        </div>
        <div class="info-item">
          <span class="label">考勤状态：</span>
          <span class="value">{{ studentInfo.status === 1 ? '正常' : studentInfo.status === 0 ? '缺勤' : '未处理' }}</span>
        </div>
        
        <!-- 系统照片 -->
        <div class="system-photos" v-if="studentInfo.images && studentInfo.images.length">
          <h5>系统照片</h5>
          <div class="photos-container">
            <div class="photo-item" v-for="(photo, index) in studentInfo.images" :key="index">
              <img :src="photo.trim()" :alt="'系统照片' + (index + 1)" />
            </div>
          </div>
        </div>
      </div>
      
      <!-- 人脸识别记录表格 -->
      <div class="recognition-records">
        <h4>人脸识别记录</h4>
        <a-table
          :columns="columns"
          :data-source="studentLogs"
          :loading="loading"
          row-key="id"
          :pagination="pagination"
          @change="handlePageChange"
        />
      </div>
    </a-card>
  </div>
</template>

<script>
import { fetchOneLiveDetailByStudent } from "@/api/logs";
import { formatTime } from "@/utils/common";

export default {
  name: "StudentLiveLogDetail",
  data() {
    return {
      live_config_id: this.$route.params.live_config_id,
      student_id: this.$route.params.student_id,
      studentLogs: [],
      loading: false,
      studentInfo: {},
      listParam: {
        page: 1,
        pageSize: 10,
      },
      pagination: {
        current: 1,
        total: 0,
        pageSize: 10,
      },
      columns: [
        {
          title: "记录ID",
          dataIndex: "id",
          key: "id"
        },
        {
          title: "创建时间",
          dataIndex: "create_time",
          key: "create_time",
          customRender: (text) => formatTime(text, "YYYY-MM-DD HH:mm:ss")
        },
        {
          title: "用户ID",
          dataIndex: "user_id",
          key: "user_id"
        },
        {
          title: "用户名称",
          dataIndex: "name",
          key: "name"
        },
        {
          title: "识别结果",
          dataIndex: "result",
          key: "result",
          customRender: (text) => (text === 1 ? "识别正常" : "识别异常")
        }
      ]
    };
  },
  mounted() {
    this.fetchStudentLogs();
  },
  methods: {
    fetchStudentLogs() {
      this.loading = true;
      fetchOneLiveDetailByStudent(this.live_config_id, this.student_id, this.listParam).then((res) => {
        if (res.status) {
          this.$message.error(res.msg || "获取数据失败，请稍后再试。");
          return;
        }
        // 保存学生基本信息
        this.studentInfo = res.data || {};
        // 保存人脸识别记录
        this.studentLogs = res.pageBean.list || [];
        // 更新分页信息
        this.pagination.current = res.pageBean.currentPage || 1;
        this.pagination.total = res.pageBean.allRow || 0;
      }).catch(error => {
        console.error("获取学生日志详情失败:", error);
        this.$message.error("获取学生日志详情失败");
      }).finally(() => {
        this.loading = false;
      });
    },
    // 处理分页变化
    handlePageChange(pagination) {
      this.listParam.page = pagination.current;
      this.listParam.pageSize = pagination.pageSize;
      this.fetchStudentLogs();
    },
    formatTime
  }
};
</script>

<style lang="less" scoped>
.student-log-detail {
  padding: 0 20px;
  
  .student-info {
    margin-bottom: 20px;
    padding: 15px;
    border: 1px solid #eee;
    border-radius: 4px;
    
    .info-item {
      margin-bottom: 10px;
      
      .label {
        font-weight: bold;
        margin-right: 10px;
      }
      
      .value {
        color: #333;
      }
    }
    
    .system-photos {
      margin-top: 15px;
      
      .photos-container {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        
        .photo-item {
          width: 120px;
          height: 120px;
          overflow: hidden;
          border-radius: 4px;
          border: 1px solid #eee;
          
          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }
      }
    }
  }
  
  .recognition-records {
    margin-top: 20px;
  }
}
</style>