<template>
  <a-card :bordered="false">
    <div style="margin-bottom: 24px">
      <a-button type="primary" @click="downloadExcel">导出</a-button>
    </div>
    <a-table v-bind="table" @change="handleTableChange"></a-table>
  </a-card>
</template>

<script>
import { downloadExcel, getLogs } from "@/api/logs";
export default {
  name: "components",
  data() {
    return {
      table: {
        columns: [
          {
            title: "课程名称",
            dataIndex: "course_name",
          },
          {
            title: "直播主题",
            dataIndex: "subject",
          },
          {
            title: "学生姓名",
            dataIndex: "student_name",
          },
          {
            title: "加入时间",
            dataIndex: "join_at",
          },
          {
            title: "离开时间",
            dataIndex: "leave_at",
          },
        ],
        dataSource: [],
        pagination: {
          pageSize: 20,
          total: 0,
          current: 1,
        },
      },
      listParams: {
        page: 1,
        pageSize: 20,
      },
    };
  },
  created() {
    this.fetch();
  },
  methods: {
    fetch() {
      getLogs(this.listParams).then(res => {
        if (res.status) {
          this.$message.error(res.msg || "获取数据失败，请稍后再试。");
          return;
        }
        this.table.dataSource = res.pageBean.list;
        this.table.pagination.current = res.pageBean.currentPage;
        this.table.pagination.total = res.pageBean.allRow;
      });
    },
    handleTableChange(pagination) {
      this.listParams.page = pagination.current;
      this.listParams.pageSize = pagination.pageSize;
      this.fetch();
    },
    downloadExcel,
  },
};
</script>

<style lang="less" scoped></style>
