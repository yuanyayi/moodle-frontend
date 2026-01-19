<template>
  <a-card :bordered="false" class="student-detail-container">
    <!-- 学生基本信息 -->
    <div class="student-info-section">
      <h3>学生信息</h3>
      <div class="info-row">
        <span class="label">学生ID：</span>
        <span class="value">{{ studentInfo.student_id }}</span>
      </div>
      <div class="info-row">
        <span class="label">学生名称：</span>
        <span class="value">{{ studentInfo.student_name }}</span>
      </div>
      <div class="info-row">
        <span class="label">考勤状态：</span>
        <span class="value">{{ studentInfo.status === 1 ? '正常' : studentInfo.status === 0 ? '缺勤' : '未处理' }}</span>
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
      <h3>抓取照片</h3>
      <div class="photos-container">
        <div class="photo-item" v-for="(photo, index) in allPhotos" :key="index">
          <img :src="photo.url" alt="抓取照片" />
        </div>
      </div>

      <!-- 分页导航 -->
      <a-pagination v-bind="pagination" @change="pageChange" style="text-align: right" />
    </div>
  </a-card>
</template>

<script>
import { getStudentRecordPage } from "@/api/distinguish";
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

      getStudentRecordPage(this.attendanceStatusId, this.listParam)
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
  flex-flow: row wrap;
}

.student-info-section h3 {
  flex: 0 0 100%;
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
