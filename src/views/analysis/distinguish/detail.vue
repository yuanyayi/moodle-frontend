<template>
  <a-card :bordered="false" class="distinguish-detail-container">
    <!-- 直播基本信息 -->
    <div class="live-info-section">
      <div class="title" style="line-height:26px">{{ liveInfo.subject }}<status-tag
          :color="liveInfo.replay ? '#13C74F' : '#6E7079'" :text="liveInfo.replay ? '已开放回放' : '未开放回放'" /></div>
      <div>
        <span class="info-item">
          <a-icon :component="detail1" />
          <span class="label">相关课程：</span>
          <span class="value">{{ liveInfo.course_name }}</span>
        </span>
        <span class="info-item">
          <a-icon :component="detail2" />
          <span class="label">直播时间：</span>
          <span class="value">{{ formatTime(liveInfo.start_time, "YYYY-MM-DD HH:mm") }}</span>
        </span>
        <span class="info-item">
          <a-icon :component="detail3" />
          <span class="label">老师：</span>
          <span class="value">{{ liveInfo.teacher_name || "未知" }}</span>
        </span>
      </div>
    </div>

    <!-- 搜索区域 -->
    <div class="search-bar-wrapper">
      <div class="table-page-search-wrapper">
        <SearchForm :queryField="queryField" :queryParam="queryParam" @queryFilter="queryFilter"
          @clearQuery="clearQuery"></SearchForm>
      </div>
      <a-button @click="handleDownloadExcel" icon="download">导出数据</a-button>
    </div>

    <!-- 批量操作区域 -->
    <div v-if="selectedRowKeys.length > 0" class="batch-actions">
      <a-button type="link" @click="batchUpdate(1)">批量出勤</a-button>
      <a-button type="link" @click="batchUpdate(-1)" class="danger">批量缺勤</a-button>
      <a-button type="link" @click="clearSelection">取消选择</a-button>
    </div>

    <!-- 学生考勤列表 -->
    <div class="student-list-section">
      <a-table :columns="columns" :data-source="studentList" :pagination="pagination" :loading="loading"
        :row-key="record => record.id" :row-selection="rowSelection" @change="handleTableChange">
      </a-table>
    </div>
  </a-card>
</template>

<script>
import SearchForm from "@/components/SearchForm.vue";
import StatusTag from "@/components/Common/StatusTag.vue";
import { formatTime, readFromList } from "@/utils/common";
import { getStudentAttendanceList, downloadExcel, batchUpdateAttendanceState } from "@/api/distinguish";
import { getLiveMaps } from "@/api/live";
import { detail1, detail2, detail3 } from "@/core/icons";

export default {
  name: "DistinguishDetail",
  components: {
    SearchForm,
    StatusTag,
  },
  computed: {
    live_id() {
      return this.$route.params.id;
    },
    rowSelection() {
      return {
        selectedRowKeys: this.selectedRowKeys,
        onChange: this.onSelectChange,
      };
    },
  },
  data() {
    return {
      detail1,
      detail2,
      detail3,
      loading: false,
      liveInfo: {},
      studentList: [],
      selectedRowKeys: [],
      queryField: {
        status: {
          type: "select",
          label: "考勤状态",
          list: [],
        },
      },
      queryParam: {
        status: undefined,
      },
      pagination: {
        current: 1,
        total: 0,
        pageSize: 20,
      },
      listParam: {
        page: 1,
        pageSize: 20,
      },
      columns: [
        {
          title: <div class='nowrap'>学生ID</div>,
          dataIndex: "student_id",
          key: "student_id",
        },
        {
          title: <div class='nowrap'>学生名称</div>,
          dataIndex: "student_name",
          key: "student_name",
        },
        {
          title: <div class='nowrap'>人脸识别次数</div>,
          dataIndex: "count",
          key: "count",
        },
        {
          title: <div class='nowrap'>匹配成功次数</div>,
          dataIndex: "match_count",
          key: "match_count",
        },
        {
          title: <div class='nowrap'>考勤状态</div>,
          dataIndex: "status",
          key: "status",
          customRender: text => {
            return readFromList(text, this.attendanceStatusMap);
          },
        },
        {
          title: <div class='nowrap'>操作</div>,
          dataIndex: "id",
          key: "action",
          customRender: id => {
            return (
              <a-button size='small' type='link' onClick={() => this.gotoStudentDetail(id)}>
                查看详情
              </a-button>
            );
          },
        },
      ],
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
        this.queryField.status.list = map.attendanceStatusMap;
      });
    },
    async fetch() {
      this.loading = true;

      try {
        // 获取学生考勤列表
        const res = await getStudentAttendanceList({
          live_id: this.live_id,
          status: this.queryParam.status,
          ...this.listParam,
        });
        // 获取直播详情
        this.liveInfo = res.data;

        // 处理学生考勤数据
        this.studentList = res.pageBean.list.map(item => ({
          ...item,
          attendance_status: item.attendance_status || "pending",
        }));

        this.pagination.total = res.pageBean.allRow;
      } catch (error) {
        console.error("获取数据失败:", error);
      } finally {
        this.loading = false;
      }
    },

    handleTableChange(pagination, filters, sorter) {
      this.listParam.page = pagination.current;
      this.listParam.pageSize = pagination.pageSize;
      this.fetch();
    },

    onSelectChange(selectedRowKeys) {
      this.selectedRowKeys = selectedRowKeys;
    },

    batchUpdate(status) {
      batchUpdateAttendanceState(this.selectedRowKeys,
        status,
      )
        .then(() => {
          this.$message.success("批量更新成功");
          this.selectedRowKeys = [];
          this.fetch();
        })
        .catch(() => {
          this.$message.error("批量更新失败");
        });
    },

    clearSelection() {
      this.selectedRowKeys = [];
    },

    queryFilter() {
      this.listParam.page = 1;
      this.fetch();
    },

    clearQuery() {
      this.listParam.page = 1;
      this.queryParam = {
        status: undefined,
      };
      this.fetch();
    },

    gotoStudentDetail(attendance_status_id) {
      // 直接跳转到analysis模块中的学生人脸识别记录详情页
      this.$router.push({
        name: "studentFaceDetail",
        params: { id: attendance_status_id },
      });
    },

    handleDownloadExcel() {
      downloadExcel(this.live_id, this.queryParam.status);
    },

    // ---------- Filters ---------- //
    formatTime,
  },
};
</script>

<style lang="less" scoped>
.distinguish-detail-container {
  margin-bottom: 24px;
}

.live-info-section {
  padding: 24px;
  background: url('@/assets/bg/image@2x.png') right center / auto 100%, linear-gradient(180deg, #F3F7FF 0%, rgba(243, 247, 255, 0) 100%);
  background-repeat: no-repeat;
  border-radius: 16px;
  margin-bottom: 16px;
  display: flex;
  flex-flow: row wrap;

  .title {
    width: 100%;
    margin-bottom: 16px;
    font-size: 18px;
    font-weight: 600;
    color: #333;
  }

  .info-item {
    margin-right: 20px;

    >*+* {
      margin-left: 8px;
    }

    .anticon {
      vertical-align: middle;
      font-size: 22px;
    }

    .label {
      width: 100px;
      font-weight: 500;
      color: #666;
    }

    .value {
      flex: 1;
      color: #333;
    }
  }
}

.search-bar-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: top;

  .table-page-search-wrapper {
    flex: 1;
  }
}

.batch-actions {
  margin-bottom: 12px;

  .ant-btn {
    margin-right: 8px;
  }
}

.student-list-section {
  background-color: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
}

// 状态样式
.success {
  color: #52c41a;
  font-weight: 500;
}

.danger {
  color: #f5222d;
  font-weight: 500;
}

.warning {
  color: #faad14;
  font-weight: 500;
}

// 表格样式
.ant-table {
  .ant-table-body {
    .ant-table-cell {
      padding: 12px 16px;
    }
  }
}

.ant-table {
  .ant-table-body {
    .ant-table-cell {
      padding: 12px 16px;
    }
  }
}
</style>