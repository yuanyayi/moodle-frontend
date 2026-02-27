<template>

  <a-card :bordered="false" style="margin-bottom: 24px">
    <div class="live-info-section">
      <div class="title" style="line-height:26px">{{ detail.subject }}<status-tag
          :color="detail.replay ? '#13C74F' : '#6E7079'" :text="detail.replay ? '已开放回放' : '未开放回放'" /></div>
      <div>
        <span class="info-item">
          <a-icon :component="detail1" />
          <span class="label">相关课程：</span>
          <span class="value">{{ detail.course_name }}</span>
        </span>
        <span class="info-item">
          <a-icon :component="detail2" />
          <span class="label">直播时间：</span>
          <span class="value">{{ formatTime(detail.start_time, "YYYY-MM-DD HH:mm") }}</span>
        </span>
        <span class="info-item">
          <a-icon :component="detail3" />
          <span class="label">老师：</span>
          <span class="value">{{ detail.teacher_name || "未知" }}</span>
        </span>
      </div>
    </div>

    <a-row :gutter="[16, 16]">
      <template v-for="(detail, index) in tableList">
        <a-col :sm="12" :md="6" :xl="6">
          <div class="tableItem">
            <div class="frame" @click="gotoReplay(detail.id)">
              <img v-show="detail.img" :src="detail.img" :alt="detail.name" />
              <img src="@/assets/icons/play.png" style="width: 32px; height: 32px" />
            </div>
            <div class="content">
              <p>
                <EditText v-if="role !== 'student'" :ref="`edit${index}`" :value="detail.name" trigger="none" @change="
                  val => {
                    editName(detail.id, val);
                  }
                " />
                <template v-else>{{ detail.name }}</template>
              </p>
              <div class="bottom-actions" v-if="role !== 'student'">
                <div class="switch-container">
                  <a-switch v-model="detail.open" size="small" @change="e => handleSwitchChange(detail.id, e)" />
                  <span>展示</span>
                </div>
                <a-dropdown>
                  <a-button type="link" icon="ellipsis" size="small" />
                  <a-menu slot="overlay">
                    <a-menu-item @click="$refs[`edit${index}`][0].openEdit()">
                      <a-icon type="edit" /> 重命名
                    </a-menu-item>
                    <a-menu-item @click="deleteLiveRecord(detail.id)">
                      <a-icon type="delete" /> 删除
                    </a-menu-item>
                  </a-menu>
                </a-dropdown>
                <a-button v-if="detail.summary_status === 0" type="primary"
                  @click="prepareSummary(detail.id)">开始总结</a-button>
                <a-button v-if="detail.summary_status === 1" disabled class="disabled-btn">总结中...</a-button>
                <a-button v-if="detail.summary_status === 2" @click="getSummary(detail.id)">查看总结</a-button>
              </div>
            </div>
          </div>
        </a-col>
      </template>
    </a-row>
    <Empty v-if="!tableList.length" />

    <a-pagination style="float: right" v-bind="pagination" @change="paginationChangeHandler" />
  </a-card>
</template>

<script>
import APagination from "ant-design-vue/es/pagination";
import Empty from "@/components/Empty.vue";
import DetailList from "@/components/DetailList";
import { formatDate, readFromList, formatTime } from "@/utils/common";
import { getLiveConfigDetail, getLiveMaps, prepareSummary, getSummary } from "@/api/live";
import { getReplayList, renameLiveRecord, deleteLiveRecord, updateOpen } from "@/api/livepage";
import EditText from "@/components/EditText";
import { mapGetters } from "vuex";
import StatusTag from "@/components/Common/StatusTag.vue";
import { detail1, detail2, detail3 } from "@/core/icons";

export default {
  name: "replayList",
  components: {
    DetailList,
    APagination,
    Empty,
    EditText,
    StatusTag,
  },
  data() {
    return {
      detail1,
      detail2,
      detail3,
      loading: false,
      listParam: {
        page: 1,
        pageSize: 10,
      },
      tableList: [],
      pagination: {
        simple: true,
        current: 1,
        total: 0,
      },
      detail: {},
      fieldsMap: {
        course_name: {
          label: "相关课程",
          type: "text",
        },
        subject: {
          label: "直播名称",
          type: "text",
        },
        teacher_name: {
          label: "老师",
          type: "text",
        },
        start_time: {
          label: "开始时间",
          type: "slot",
          slotName: "start_time",
        },
        // duration: {
        //   label: "时长",
        //   type: "number",
        // },
        // repeat: {
        //   label: "重复",
        //   type: "select",
        //   list: [],
        // },
        end_time: {
          label: "结束于",
          type: "date", // true
        },
        // replay: {
        //   label: "回放",
        //   type: "switch",
        // },
      },
      statusList: [],
    };
  },
  computed: {
    ...mapGetters(["roles"]),
    role() {
      return this.roles.id || "student";
    },
    configId() {
      return this.$route.params.configId;
    },
  },
  created() {
    this.getMaps();
    this.fetchDetail();
    this.fetch();
  },
  methods: {
    getMaps() {
      getLiveMaps(["liveStatus"]).then(map => {
        this.statusList = map.liveStatusMap;
        // "repeat"
        // this.fieldsMap.repeat.list = map.repeatMap;
      });
    },
    fetchDetail() {
      getLiveConfigDetail(this.configId).then(res => {
        this.detail = res.data;
      });
    },
    fetch() {
      this.loading = true;
      getReplayList(this.configId, {
        // ...this.queryParam,
        ...this.listParam,
      })
        .then(res => {
          this.tableList = res.pageBean.list.map(el => {
            !el.img && (el.img = "/defaultLive.jpg");
            return el;
          });
          this.pagination.current = res.pageBean.currentPage;
          this.pagination.total = res.pageBean.allRow;
        })
        .finally(_ => {
          this.loading = false;
        });
    },
    gotoReplay(liveId) {
      const routeData = this.$router.resolve({
        name: "watch",
        params: { liveConfigId: liveId },
        query: { mode: "replay" },
      });

      // 对于 history 模式，需要构建完整 URL
      const url = `${window.location.origin}${routeData.href}`;
      window.open(url, "_blank");
    },
    handleOk() {
      this.fetch();
    },
    paginationChangeHandler(page, pageSize) {
      this.listParam = { page, pageSize };
      this.fetch();
    },
    // ---------- Filters ---------- //
    getStatusText(s) {
      return this.statusList.find(el => el.value == s)?.label || "未知的状态";
    },
    formatDate,
    formatTime,
    readFromList,
    getStatusColor(s) {
      return ["gold", "#2db7f5", "#fff", "#87d068", "#ff4d4f", "#ff4d4f"][s] || "#87d068";
    },
    editName(id, val) {
      renameLiveRecord(id, val).then(res => {
        this.fetch();
      });
    },
    deleteLiveRecord(id) {
      this.$confirm({
        title: "确定要删除吗？",
        content: "删除后无法恢复",
        okText: "删除",
        okType: "danger",
        cancelText: "取消",
        onOk: () => {
          deleteLiveRecord(id).then(res => {
            if (res.status) {
              this.$message.error(res.msg || "获取数据失败，请稍后再试。");
              return;
            }
            this.fetch();
          });
        },
      });
    },
    //
    handleSwitchChange(liveRecordId, open) {
      updateOpen(liveRecordId, open).then(res => {
        if (res.status) {
          this.$message.error(res.msg || "获取数据失败，请稍后再试。");
          return;
        }
        this.fetch();
      });
    },

    prepareSummary(id) {
      prepareSummary(id).then(res => {
        if (res.status) {
          this.$message.error(res.msg || "获取数据失败，请稍后再试。");
          return;
        }
        this.$message.success(res.msg || "AI总结中，请等待。");
      }).finally(res => {
        this.fetch();
      });
    },
    getSummary(id) {
      getSummary(id).then(res => {
        if (res.status) {
          this.$message.error(res.msg || "获取数据失败，请稍后再试。");
          return;
        }
        this.$info({
          title: "查看总结",
          content: res.data,
        });
      });
    },
  },
};
</script>

<style lang="less" scope>
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

.tableItem {
  box-sizing: border-box;
  padding: 16px;
  border: 1px solid #E9EBF1;
  display: flex;
  flex-direction: column;
  position: relative;
  width: 100%;
  border-radius: 8px;
  background: #FFFFFF;
  box-shadow: 0px 8px 24px 0px rgba(46, 93, 209, 0.08), 0px 8px 16px 0px rgba(46, 93, 209, 0.04);

  &:hover {
    box-shadow: 0px 8px 24px 0px rgba(46, 93, 209, 0.12), 0px 8px 16px 0px rgba(46, 93, 209, 0.08);
  }

  p {
    margin: 12px 0;
    font-size: 14px;
    line-height: 20px;
    color: #111111;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .frame {
    width: 100%;
    height: 140px;
    text-align: center;
    position: relative;
    overflow: hidden;
    background-color: #f0f0f0;
    border-radius: 6px;
    cursor: pointer;

    img:first-child {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    img:last-child {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 1;
    }
  }

  .content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .bottom-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    margin-top: 12px;
    gap: 12px;

    .switch-container {
      margin-right: auto;
      display: flex;
      align-items: center;

      span {
        margin-left: 8px;
        font-size: 12px;
        color: #1890ff;
      }
    }

    a-button {
      font-size: 12px;
    }
  }

  .content .operateBtn {
    color: grey;
    margin-left: 10px;
    vertical-align: middle;
    box-shadow: none;
  }
}

.greenBtn {
  background-color: #52c41a;
  border-color: #52c41a;
  color: #fff;

  &:hover {
    background-color: #73d13d;
    border-color: #73d13d;
    color: #fff;
  }
}

.disabled-btn {
  background: rgba(5, 124, 251, 0.1) !important;
  border: 1px solid rgba(5, 124, 251, 0.4) !important;
  color: #1E69FF !important;
}
</style>
