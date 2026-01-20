<template>
  <div class="log-detail">
    <a-card :bordered="false">
      <!-- 直播信息区域 -->
      <div class="live-info-section">
        <h3>直播信息</h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">相关课程：</span>
            <span class="value">{{ liveInfo.course_name }}</span>
          </div>
          <div class="info-item">
            <span class="label">直播名称：</span>
            <span class="value">{{ liveInfo.subject }}</span>
          </div>
          <div class="info-item">
            <span class="label">老师：</span>
            <span class="value">{{ liveInfo.teacher_name }}</span>
          </div>
          <div class="info-item">
            <span class="label">直播回放：</span>
            <span class="value">{{ liveInfo.replay ? '开启回放' : '未开启回放' }}</span>
          </div>
          <div class="info-item">
            <span class="label">直播时间：</span>
            <span class="value">{{ formatTime(liveInfo.start_time, "YYYY-MM-DD HH:mm") }}</span>
          </div>
        </div>
      </div>

      <!-- 学生观看记录列表 -->
      <div class="student-records-section">
        <a-table
          :columns="columns"
          :data-source="studentRecords"
          :pagination="pagination"
          :loading="loading"
          row-key="student_id"
          @change="handleTableChange"
        >
          <template slot="action" slot-scope="text, record">
            <a-button type="link" @click="viewDetail(record.student_id)">查看详情</a-button>
          </template>
        </a-table>
      </div>
    </a-card>
  </div>
</template>

<script>
import { fetchLogsByLive } from "@/api/logs";
import { formatTime } from "@/utils/common";
import { mapGetters } from "vuex";

export default {
  name: "LiveLogDetail",
  data() {
    return {
      liveConfigId: this.$route.params.live_config_id,
      liveInfo: {},
      loading: false,
      
      // 学生记录列表
      studentRecords: [],
      params: {
        page: 1,
        pageSize: 10,
      },
      pagination: {
        current: 1,
        total: 0,
        pageSize: 10,
        showSizeChanger: true,
        pageSizeOptions: ["10", "20", "50", "100"],
        showTotal: (total) => `共 ${total} 条记录`,
      },
      columns: [
        {
          title: "学生ID",
          dataIndex: "student_id",
          key: "student_id",
        },
        {
          title: "学生名称",
          dataIndex: "student_name",
          key: "student_name",
        },
        {
          title: "离开次数",
          dataIndex: "leave_num",
          key: "leave_num",
        },
        {
          title: "操作",
          key: "action",
          scopedSlots: { customRender: "action" },
        },
      ],
    };
  },
  computed: {
    ...mapGetters(["roles"]),
    role() {
      return this.roles.id || "student";
    },
  },
  mounted() {
    this.fetchStudentRecords();
  },
  methods: {
    fetchStudentRecords() {
      this.loading = true;
      const params = {
        ...this.params
      };
      
      fetchLogsByLive(this.liveConfigId, params).then((res) => {
        if (res.status) {
          this.$message.error(res.msg || "获取数据失败，请稍后再试。");
          return;
        }
        
        // 接口返回的数据结构包含data和pageBean
        this.liveInfo = res.data || {};
        this.studentRecords = res.pageBean?.list || [];
        this.pagination.current = res.pageBean?.currentPage || 1;
        this.pagination.pageSize = res.pageBean?.pageSize || 10;
        this.pagination.total = res.pageBean?.allRow || 0;
      }).catch(error => {
        console.error("获取学生记录失败:", error);
        this.$message.error("获取学生记录失败");
      }).finally(() => {
        this.loading = false;
      });
    },
    handleTableChange(pagination) {
      this.params = {
        page: pagination.current,
        pageSize: pagination.pageSize
      };
      this.fetchStudentRecords();
    },
    viewDetail(studentId) {
      // 跳转到学生日志详情页面
      this.$router.push({
        name: "studentLiveLogDetail",
        params: {
          live_config_id: this.liveConfigId,
          student_id: studentId
        }
      });
    },
    // 添加t方法解决国际化问题
    t(key) {
      return this.$t(key);
    },
    formatTime,
  },
};
</script>

<style scoped>
.log-detail {
  padding: 0 20px;
}

.live-info-section {
  margin-bottom: 24px;
}

.live-info-section h3 {
  font-size: 16px;
  margin-bottom: 16px;
  font-weight: bold;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  padding: 16px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.info-item {
  display: flex;
  align-items: center;
}

.label {
  font-weight: bold;
  margin-right: 8px;
}

.student-records-section {
  margin-top: 24px;
}
</style>