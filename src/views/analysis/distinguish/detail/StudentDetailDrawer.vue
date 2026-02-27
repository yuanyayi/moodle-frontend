<template>
  <a-drawer title="学生人脸识别记录" placement="right" :width="800" :visible="visible" :closable="true" :mask="true" :mask-closable="true"
    @close="handleClose">
    <div v-if="loading" class="loading-container">
      <a-spin tip="加载中..." size="large" />
    </div>
    <div v-else class="student-detail-content">
      <!-- 学生基本信息 -->
      <div class="info-section">
        <div class="student-header">
          <div class="student-name">{{ studentInfo.student_name || '未知' }}</div>
          <div class="student-id">学生ID：{{ studentInfo.student_id || '未知' }}</div>
          <div class="attendance-status">
            <a-icon :component="statusIcon" style="margin-right: 4px;" />
            {{ attendanceStatusText }}
          </div>
        </div>
      </div>

      <!-- 人脸识别记录 -->
      <div class="records-section">
        <h3>人脸识别记录</h3>
        <a-table :columns="columns" :data-source="faceRecords" :loading="loading">
        </a-table>
      </div>
    </div>
  </a-drawer>
</template>

<script>
import { status1, status0, statusMinus1 } from "@/core/icons";

export default {
  name: 'StudentDetailDrawer',
  data() {
    return {
      visible: false,
      attendanceStatusId: '',
      loading: false,
      studentInfo: {
        student_id: '20231001',
        student_name: '张三',
        status: -1
      },
      faceRecords: [],
      columns: [
        {
          title: '识别时间',
          dataIndex: 'recognize_time',
          key: 'recognize_time'
        },
        {
          title: '识别结果',
          dataIndex: 'result',
          key: 'result',
          customRender: text => {
            return text ? '成功' : '失败';
          }
        },
        {
          title: '相似度',
          dataIndex: 'similarity',
          key: 'similarity',
          customRender: text => {
            return text ? `${text.toFixed(2)}%` : '未知';
          }
        }
      ]
    };
  },
  computed: {
    statusIcon() {
      const status = this.studentInfo.status;
      if (status === 1) return status1;
      if (status === -1) return statusMinus1;
      return status0;
    },
    attendanceStatusText() {
      const status = this.studentInfo.status;
      if (status === 1) return '出勤';
      if (status === -1) return '缺勤';
      return '未处理';
    }
  },
  methods: {
    show(id) {
      this.attendanceStatusId = id;
      this.visible = true;
      this.loadData();
    },
    close() {
      this.visible = false;
    },
    handleClose() {
      this.visible = false;
    },
    async loadData() {
      if (!this.attendanceStatusId) return;

      this.loading = true;
      try {
        // 这里需要根据实际的API来获取数据
        // 假设API是getStudentFaceDetail
        // const res = await getStudentFaceDetail(this.attendanceStatusId);
        // this.studentInfo = res.student;
        // this.faceRecords = res.faceRecords;

        // 模拟数据
        this.studentInfo = {
          student_id: '10001',
          student_name: '张三'
        };
        this.faceRecords = [
          {
            key: '1',
            recognize_time: '2026-02-26 10:00:00',
            result: true,
            similarity: 95.5
          },
          {
            key: '2',
            recognize_time: '2026-02-26 10:05:00',
            result: true,
            similarity: 92.3
          },
          {
            key: '3',
            recognize_time: '2026-02-26 10:10:00',
            result: false,
            similarity: 65.7
          }
        ];
      } catch (error) {
        console.error('获取学生详情失败:', error);
        this.$message.error('获取学生详情失败');
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.student-detail-content {
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

.attendance-status {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #333;
}

.records-section {
  margin-bottom: 16px;
}

.records-section h3 {
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
}
</style>