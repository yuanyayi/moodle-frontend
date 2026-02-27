<template>
  <a-drawer title="学生考勤详情" placement="right" :width="'100%'" :visible="visible" :closable="true" :mask-closable="true"
    @close="handleClose" :style="{ maxWidth: '800px' }">
    <div v-if="loading" class="loading-container">
      <a-spin tip="加载中..." size="large" />
    </div>
    <div v-else class="student-detail-content">
      <!-- 学生基本信息 -->
      <div class="info-section">
        <h3>学生信息</h3>
        <div class="info-item">
          <span class="label">学生ID：</span>
          <span class="value">{{ studentInfo.student_id || '未知' }}</span>
        </div>
        <div class="info-item">
          <span class="label">学生姓名：</span>
          <span class="value">{{ studentInfo.student_name || '未知' }}</span>
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
export default {
  name: 'StudentDetailDrawer',
  data() {
    return {
      visible: false,
      attendanceStatusId: '',
      loading: false,
      studentInfo: {},
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
  background-color: #f5f5f5;
  border-radius: 8px;
}

.info-section h3,
.records-section h3 {
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.info-item {
  margin-bottom: 8px;
  display: flex;
  align-items: center;
}

.label {
  width: 80px;
  font-weight: 500;
  color: #666;
}

.value {
  flex: 1;
  color: #333;
}

.records-section {
  margin-bottom: 16px;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
}
</style>