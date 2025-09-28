<template>
  <a-card :bordered="false" class="student-detail-container">
    <!-- 学生基本信息 -->
    <div class="student-info-section">
      <div class="info-row">
        <span class="label">学生ID：</span>
        <span class="value">{{ studentInfo.student_id }}</span>
      </div>
      <div class="info-row">
        <span class="label">学生名称：</span>
        <span class="value">{{ studentInfo.student_name }}</span>
      </div>
    </div>

    <!-- 系统照片 -->
    <div class="system-photos-section">
      <h3>系统照片</h3>
      <div class="photos-container">
        <div v-for="(photo, index) in systemPhotos" :key="photo" class="photo-item">
          <img :src="photo" :alt="'系统照片' + (index + 1)" />
          <p>{{ "系统照片" + (index + 1) }}</p>
        </div>
      </div>
    </div>

    <!-- 抓取照片 -->
    <div class="captured-photos-section">
      <h3>
        抓取照片
        <!-- 操作按钮 -->
        <a-space style="margin-left: 100px">
          <a-button @click="confirmAttendance" size="small">确认出勤</a-button>
          <a-button @click="confirmAbsent" size="small">确认缺勤</a-button>
          <a-tag color="red">异常处理完成，计算考勤</a-tag>
        </a-space>
      </h3>
      <div class="photos-container">
        <div class="photo-item" v-for="(photo, index) in displayedPhotos" :key="index">
          <img :src="photo.url" alt="抓取照片" />
          <div class="photo-info">
            <span class="timestamp">{{ photo.timestamp }}</span>
            <span class="status" :class="{ normal: photo.result == 1, abnormal: photo.result == 0 }">
              {{ ["识别异常", "识别正常"][photo.result] }}
            </span>
          </div>
        </div>
      </div>

      <!-- 分页导航 -->
      <a-pagination v-bind="pagination" @change="pageChange" style="text-align: right" />
    </div>
  </a-card>
</template>

<script>
import { getStudentDetail, updateAttendanceState } from "@/api/distinguish";
import { getLiveMaps } from "@/api/live";
import { Pagination as APagination } from "ant-design-vue";

export default {
  name: "StudentDetail",
  components: {
    APagination,
  },
  data() {
    return {
      loading: false,
      listParam: { page: 1, pageSize: 20 },
      pagination: {
        current: 1,
        total: 0,
        pageSize: 20,
      },
      studentInfo: {},
      systemPhotos: [],
      allPhotos: [],
      currentPage: 1,
      photosPerPage: 10,
      totalPhotos: 0,

      attendanceStatusMap: [],
    };
  },
  created() {
    this.getMaps();
    this.fetch();
  },
  methods: {
    getMaps() {
      getLiveMaps(["attendanceStatus"]).then(map => {
        this.attendanceStatusMap = map.attendanceStatusMap;
      });
    },
    // 获取学生详细信息和照片
    fetch() {
      this.loading = true;

      getStudentDetail(this.attendanceStatusId, this.listParam)
        .then(res => {
          // 处理学生基本信息
          this.studentInfo = res.data || {};

          // 处理系统照片
          this.systemPhotos = res.data.images || [];

          // 处理抓取照片
          this.allPhotos = res.pageBean.list || [];

          // 更新总照片数
          this.pagination = {
            ...this.pagination,
            page: res.pageBean.currentPage,
            total: res.pageBean.allRow,
          };
        })
        .finally(() => {
          this.loading = false;
        });
    },

    // 分页切换
    pageChange(page, pageSize) {
      this.listParam = { page, pageSize };
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
      });
    },
  },
  watch: {
    // 监听路由变化，重新加载数据
    $route(to, from) {
      if (to.name === "studentDetail") {
        this.fetch();
      }
    },
  },
  computed: {
    // 获取路由参数
    attendanceStatusId() {
      return this.$route.params.id;
    },
    // 计算当前页显示的照片
    displayedPhotos() {
      const startIndex = (this.currentPage - 1) * this.photosPerPage;
      const endIndex = startIndex + this.photosPerPage;
      return this.allPhotos.slice(startIndex, endIndex);
    },
  },
};
</script>

<style scoped>
.student-detail-container {
  padding: 20px;
  font-family: Arial, sans-serif;
}

/* 信息区域样式 */
.student-info-section {
  border: 1px solid #ddd;
  padding: 15px;
  margin-bottom: 20px;
  border-radius: 4px;
  display: flex;
}

.info-row {
  flex: 1 1 50%;
  display: flex;
}

.label {
  width: 100px;
  font-weight: bold;
}

.value {
  flex: 1;
}

/* 照片区域样式 */
.system-photos-section,
.captured-photos-section {
  border: 1px solid #ddd;
  padding: 15px;
  margin-bottom: 20px;
  border-radius: 4px;
}

.photos-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}

.photo-item {
  text-align: center;
  flex: 0 0 calc(20% - 10px);
  min-width: 100px;
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

/* 抓取照片信息样式 */
.photo-info {
  margin-top: 5px;
  font-size: 12px;
}

.timestamp {
  color: #666;
  margin-right: 10px;
}

.status {
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 12px;
}

.status.normal {
  background-color: #e6f7ff;
  color: #1890ff;
}

.status.abnormal {
  background-color: #fff1e6;
  color: #ff4d4f;
}
</style>
