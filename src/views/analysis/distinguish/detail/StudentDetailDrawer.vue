<template>
  <a-drawer title="学生考勤详情" placement="right" :width="800" :visible="visible" :closable="true" :mask="true"
    :mask-closable="true" @close="handleClose">
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

      <!-- 识别记录 -->
      <div class="records-section">
        <!-- 申诉弹窗 -->
        <a-modal v-model="showAppealModal" title="申诉" @ok="handleAppeal" @cancel="showAppealModal = false"
          :okText="'提交'">
          <a-form :form="appealForm" layout="vertical">
            <a-form-item label="申诉理由">
              <a-textarea v-decorator="['content', { rules: [{ required: true, message: '请输入申诉理由' }] }]" :rows="4"
                placeholder="请输入申诉理由" />
            </a-form-item>
          </a-form>
        </a-modal>

        <!-- 系统照片 -->
        <div class="system-photos-section">
          <h4>系统照片</h4>
          <div class="photos-container">
            <div v-for="(photo, index) in systemPhotos" :key="photo" class="photo-item">
              <img :src="photo" :alt="'系统照片' + (index + 1)" />
              <p>{{ "系统照片" + (index + 1) }}</p>
            </div>
          </div>

          <!-- 抓取照片 -->
          <h4>抓取照片
            <!-- 操作按钮 -->
            <a-space>
              <template v-if="isNotStudent">
                
                <a-button @click="confirmAttendance">确认出勤</a-button>
                <a-button @click="confirmAbsent">确认缺勤</a-button>
              </template>
              <template v-if="!isNotStudent && studentInfo.can_appeal">
                <a-button @click="showAppealModal = true" type="danger" ghost>申诉</a-button>
              </template>
            </a-space>
          </h4>

          <div class="photos-container">
            <div class="photo-item" v-for="(photo, index) in allPhotos" :key="index">
              <img :src="photo.url" alt="抓取照片" />
              <p :class="{ 'recognition-success': photo.result === 1, 'recognition-failed': photo.result === 0 }">
                {{ photo.result === 1 ? '识别成功' : photo.result === 0 ? '识别失败' : '' }}
              </p>
            </div>
          </div>

          <!-- 分页导航 -->
          <a-pagination 
            v-bind="pagination"
            @change="pageChange" 
            @showSizeChange="onShowSizeChange"
            style="text-align: right"
            size="small" />
        </div>
      </div>
    </div>
  </a-drawer>
</template>

<script>
import { status1, status0, statusMinus1 } from "@/core/icons";
import { getStudentRecordPage, updateAttendanceState, studentAppeal } from "@/api/distinguish";
import { getLiveMaps } from "@/api/live";
import { mapGetters } from "vuex";

export default {
  name: 'StudentDetailDrawer',
  data() {
    return {
      visible: false,
      attendanceStatusId: '',
      loading: false,
      listParam: { page: 1, pageSize: 20 },
      pagination: {
        current: 1,
        total: 0,
        pageSize: 20,
        showSizeChanger: true,
        pageSizeOptions: ["10", "20", "50", "100"],
        showTotal: (total) => `共 ${total} 条数据`,
      },
      studentInfo: {},
      systemPhotos: [],
      allPhotos: [],
      attendanceStatusMap: [],
      showAppealModal: false,
      appealForm: this.$form.createForm(this),
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
    },
    // 判断当前用户是否是学生
    isNotStudent() {
      return this.userInfo?.roleId !== 'student'
    },
    ...mapGetters(['userInfo']),
  },
  methods: {
    show(id) {
      this.attendanceStatusId = id;
      this.visible = true;
      this.getMaps();
      this.fetch();
    },
    close() {
      this.visible = false;
    },
    handleClose() {
      this.visible = false;
    },
    getMaps() {
      getLiveMaps(["attendanceStatus"]).then(map => {
        this.attendanceStatusMap = map.attendanceStatusMap;
      });
    },
    // 获取学生详细信息和照片
    fetch() {
      if (!this.attendanceStatusId) return;

      this.loading = true;

      getStudentRecordPage(this.attendanceStatusId, this.listParam)
        .then(res => {
          // 处理学生基本信息
          this.studentInfo = res.data || {};

          // 处理系统照片
          this.systemPhotos = res.data.images || [];

          // 处理抓取照片
          this.allPhotos = res.pageBean.list || [];

          // 更新分页信息
          this.pagination.current = res.pageBean.currentPage;
          this.pagination.pageSize = res.pageBean.pageSize || 20;
          this.pagination.total = res.pageBean.allRow;
        })
        .catch(error => {
          console.error('获取学生详情失败:', error);
          this.$message.error('获取学生详情失败');
        })
        .finally(() => {
          this.loading = false;
        });
    },

    // 分页切换
    pageChange(page, pageSize) {
      console.log('Page change:', page, pageSize);
      // 确保参数是数字类型
      const currentPage = Number(page);
      const currentPageSize = Number(pageSize);
      this.listParam = { page: currentPage, pageSize: currentPageSize };
      // 同时更新pagination对象
      this.pagination.current = currentPage;
      this.pagination.pageSize = currentPageSize;
      this.fetch();
    },
    
    // 每页条目变化
    onShowSizeChange(current, size) {
      console.log('Show size change:', current, size);
      // 确保参数是数字类型
      const currentPage = Number(current);
      const currentPageSize = Number(size);
      this.listParam = { page: currentPage, pageSize: currentPageSize };
      // 同时更新pagination对象
      this.pagination.current = currentPage;
      this.pagination.pageSize = currentPageSize;
      this.fetch();
    },

    // 确认出勤
    confirmAttendance() {
      updateAttendanceState(this.attendanceStatusId, 1).then(res => {
        if (res.status) {
          this.$message.error(res.msg || "获取数据失败，请稍后再试。");
          return;
        }
        this.$message.success("已确认出勤");
        this.fetch();
        // 通知主页面刷新列表
        this.$emit('refresh');
      });
    },

    // 确认缺勤
    confirmAbsent() {
      updateAttendanceState(this.attendanceStatusId, -1).then(res => {
        if (res.status) {
          this.$message.error(res.msg || "获取数据失败，请稍后再试。");
          return;
        }
        this.$message.success("已确认缺勤");
        this.fetch();
        // 通知主页面刷新列表
        this.$emit('refresh');
      });
    },

    handleAppeal() {
      this.appealForm.validateFields((err, values) => {
        if (!err) {
          studentAppeal(this.attendanceStatusId, values.content,).then(() => {
            this.$message.success("申诉已提交");
            this.studentInfo.can_appeal = false;
            this.showAppealModal = false;
            this.appealForm.resetFields();
          }).catch(() => {
            this.$message.error("申诉提交失败");
          });
        }
      });
    },
  }
};
</script>

<style scoped lang="less">
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

.records-section h4 {
  padding: 8px 16px;
  margin-bottom: 0;
  color: #111;
  background: linear-gradient(270deg, rgba(25, 120, 254, 0) 0%, rgba(5, 124, 251, 0.05) 100%);
  box-sizing: border-box;
  border-width: 0px 0px 0px 2px;
  border-style: solid;
  border-color: #057CFB;
  display: flex;
  justify-content: space-between;
  align-items: center;

  >* {
    margin: -6px 0;
  }
}

/* 照片区域样式 */
.system-photos-section {
  margin-bottom: 4px;
}

.photos-container {
  display: flex;
  flex-wrap: wrap;
  padding: 16px;
  gap: 16px;
}

.photo-item {
  text-align: center;
  flex: 0 1 calc(25% - 16px);
  min-width: 100px;
  max-width: calc(25% - 16px);
}

.photo-item img {
  width: 100%;
  height: 120px;
  object-fit: cover;
  border: 1px solid #eee;
  border-radius: 4px;
}

.photo-item p {
  margin-top: 5px;
  font-size: 12px;
  color: #666;
}

/* 识别结果样式 */
.recognition-success {
  color: #52c41a;
  text-align: center;
}

.recognition-failed {
  color: #ff4d4f;
  text-align: center;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
}
</style>