<template>
  <div class="student-log-detail">
    <a-card :bordered="false">
      <h3>学生直播日志详情</h3>
      
      <!-- 人脸识别记录表格 -->
      <div class="recognition-records">
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

export default {
  name: "StudentLiveLogDetail",
  data() {
    return {
      live_config_id: this.$route.params.live_config_id,
      student_id: this.$route.params.student_id,
      studentLogs: [],
      loading: false,
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
          title: "学生ID",
          dataIndex: "student_id",
        },
        {
          title: "学生名称",
          dataIndex: "student_name",
        },
        {
          title: "加入时间",
          dataIndex: "join_at",
        },
        {
          title: "离开时间",
          dataIndex: "leave_at",
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
    }
  }
};
</script>

<style lang="less" scoped>
.student-log-detail {
  padding: 0 20px;
  
  .recognition-records {
    margin-top: 20px;
  }
}
</style>