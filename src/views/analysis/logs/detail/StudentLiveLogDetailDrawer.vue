<template>
  <a-drawer title="学生直播日志详情" placement="right" :width="800" :visible="visible" :closable="true" :mask="true"
    :mask-closable="true" @close="handleClose">
    <div v-if="loading" class="loading-container">
      <a-spin tip="加载中..." size="large" />
    </div>
    <div v-else class="student-log-detail-content">
      <!-- 学生基本信息 -->
      <div class="info-section">
        <div class="student-header">
          <div class="student-name">{{ studentInfo.student_name || '未知' }}</div>
          <div class="student-id">学生ID：{{ studentInfo.student_id || '未知' }}</div>
        </div>
      </div>

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
    </div>
  </a-drawer>
</template>

<script>
import { fetchOneLiveDetailByStudent } from "@/api/logs";

export default {
  name: 'StudentLiveLogDetailDrawer',
  data() {
    return {
      visible: false,
      live_config_id: '',
      student_id: '',
      studentLogs: [],
      studentInfo: {},
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
  methods: {
    show(liveConfigId, studentId) {
      this.live_config_id = liveConfigId;
      this.student_id = studentId;
      this.visible = true;
      this.fetchStudentLogs();
    },
    close() {
      this.visible = false;
    },
    handleClose() {
      this.visible = false;
    },
    fetchStudentLogs() {
      if (!this.live_config_id || !this.student_id) return;

      this.loading = true;
      fetchOneLiveDetailByStudent(this.live_config_id, this.student_id, this.listParam).then((res) => {
        if (res.status) {
          this.$message.error(res.msg || "获取数据失败，请稍后再试。");
          return;
        }
        // 保存学生信息
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
    }
  }
};
</script>

<style scoped lang="less">
.student-log-detail-content {
  padding: 16px 0;
}

.info-section {
  margin-bottom: 24px;
  padding: 16px;
  background: linear-gradient(180deg, #F3F7FF 0%, rgba(243, 247, 255, 0) 100%);
  border-radius: 12px;
  box-sizing: border-box;
  border: 1px solid #E1EEFC;
}

.student-header {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;

  &>div {
    margin-right: 16px;
  }
}

.student-name {
  font-family: PingFang SC;
  font-size: 18px;
  font-weight: 600;
  line-height: 26px;
  letter-spacing: 0px;
  color: #333;
}

.student-id {
  height: 22px;
  border-radius: 4px;
  padding: 0px 10px;
  box-sizing: border-box;
  border: 1px solid #DCDCDC;
  font-size: 14px;
  line-height: 20px;
  color: #666;
}

.recognition-records {
  margin-top: 16px;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
}
</style>