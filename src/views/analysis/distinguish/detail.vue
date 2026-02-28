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

    <!-- 学生考勤列表 -->
    <div class="student-list-section">
      <a-table :columns="columns" :data-source="studentList" :pagination="false" :loading="loading"
        :row-key="record => record.id" :row-selection="rowSelection" @change="handleTableChange">
      </a-table>
      <!-- 批量操作和分页区域 -->
      <div class="table-footer">
        <!-- 批量操作区域 -->
        <div class="batch-actions-container">
          <div v-if="selectedRowKeys.length > 0" class="batch-actions">
            <span style="font-size: 13px;">已选择 {{ selectedRowKeys.length }} 项</span>
            <a-button type="link" @click="clearSelection" size="small" style="font-size: 13px;">取消</a-button>
            <a-button ghost type="primary" @click="batchUpdate(1)">批量出勤</a-button>
            <a-button ghost type="danger" @click="batchUpdate(-1)" class="danger">批量缺勤</a-button>
          </div>
        </div>
        <!-- 分页组件 -->
        <div class="pagination-container">
          <a-pagination :current="pagination.current" :page-size="pagination.pageSize" :total="pagination.total"
            @change="handlePaginationChange" />
        </div>
      </div>
    </div>

    <!-- 学生详情抽屉 -->
    <student-detail-drawer ref="studentDetailDrawer" @refresh="fetch" />
  </a-card>
</template>

<script>
import SearchForm from "@/components/SearchForm.vue";
import StatusTag from "@/components/Common/StatusTag.vue";
import StudentDetailDrawer from "./detail/StudentDetailDrawer.vue";
import { formatTime, readFromList } from "@/utils/common";
import { getStudentAttendanceList, downloadExcel, batchUpdateAttendanceState } from "@/api/distinguish";
import { getLiveMaps } from "@/api/live";
import { detail1, detail2, detail3, status1, status0, statusMinus1 } from "@/core/icons";

export default {
  name: "DistinguishDetail",
  components: {
    SearchForm,
    StatusTag,
    StudentDetailDrawer,
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
      status1,
      status0,
      statusMinus1,
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
        showSizeChanger: true,
        pageSizeOptions: ["10", "20", "50", "100"],
        showTotal: (total) => `共 ${total} 条数据`,
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
          customRender: (text, record, index) => {
            const statusText = readFromList(text, this.attendanceStatusMap);
            let iconComponent = null;

            if (text === 0) { // 未处理
              iconComponent = status0;
            } else if (text === 1) { // 出勤
              iconComponent = status1;
            } else if (text === -1) { // 缺勤
              iconComponent = statusMinus1;
            }

            return (
              <span>
                {iconComponent && <a-icon component={iconComponent} style={{ marginRight: '4px' }} />}
                {statusText}
              </span>
            );
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
      attendanceStatusMap: []
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

          this.pagination.current = res.pageBean.currentPage || 1;
          this.pagination.pageSize = res.pageBean.pageSize || 20;
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

    handlePaginationChange(current, pageSize) {
      this.listParam.page = current;
      this.listParam.pageSize = pageSize;
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
      this.$refs.studentDetailDrawer.show(attendance_status_id);
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

.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.batch-actions-container {
  flex: 1;
}

.batch-actions {
  .ant-btn {
    margin-right: 8px;
    font-weight: 400;
  }
}

.pagination-container {
  flex-shrink: 0;
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