<template>
  <a-card :bordered="false" style="margin-bottom: 24px">
    <a-card title="直播基本信息" style="margin-bottom: 24px">
      <a-descriptions :column="2" :bordered="false" :dataSource="detail" :size="'small'">
        <a-descriptions-item v-for="(desc, field) in fieldsMap" :key="field" :label="desc.label">
          <template v-if="['start_time', 'end_time'].indexOf(field) !== -1">
            {{ formatDate(detail[field], "YYYY-MM-DD HH:mm") }}
          </template>
          <template v-else-if="field === 'repeat'">
            {{ readFromList(detail[field], desc.list) }}
          </template>
          <template v-else-if="field === 'replay'">
            {{ detail[field] ? "是" : "否" }}
          </template>
          <template v-else>{{ detail[field] }}</template>
        </a-descriptions-item>
      </a-descriptions>
    </a-card>

    <a-row :gutter="[10, 10]">
      <template v-for="(detail, index) in tableList">
        <a-col :sm="12" :md="8" :xl="6">
          <div class="tableItem">
            <div class="frame" @click="gotoReplay(detail.id)">
              <img v-show="detail.img" :src="detail.img" :alt="detail.subject" />
              <a-icon type="play-circle" style="font-size: 50px" />
            </div>
            <div class="content">
              <p style="font-size: 18px; font-weight: 500">
                <EditText
                  v-if="role !== 'student'"
                  :ref="`edit${index}`"
                  :value="detail.name"
                  trigger="icon"
                  @change="
                    val => {
                      editName(detail.id, val);
                    }
                  ">
                  <template v-slot:addonAfter>
                    <a-button class="operateBtn" icon="edit" size="small" ghost @click.stop="$refs[`edit${index}`][0].openEdit()" />
                  </template>
                </EditText>
                <template v-else>{{ detail.name }}</template>
              </p>
              <p style="display: flex; justify-content: space-between; align-items: center">
                {{ detail.teacher_name }} {{ formatDate(+detail.start_time, "YYYY-MM-DD") }}
                <span v-if="role !== 'student'">
                  <a-switch v-model="detail.open" size="small" @change="e => handleSwitchChange(detail.id, e)" />
                  <a-button type="danger" icon="delete" size="small" ghost style="flex: none; border: none !important; box-shadow: none" @click.stop="deleteLiveRecord(detail.id)" />
                </span>
              </p>
              <p v-if="role !== 'student'">
                <a-button @click="prepareSummary(detail.id)">开始总结</a-button>
                <a-button @click="getSummary(detail.id)">查看总结</a-button>
              </p>
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
import { formatDate, readFromList } from "@/utils/common";
import { getLiveConfigDetail, getLiveMaps, prepareSummary, getSummary } from "@/api/live";
import { getReplayList, renameLiveRecord, deleteLiveRecord, updateOpen } from "@/api/livepage";
import EditText from "@/components/EditText";
import { mapGetters } from "vuex";

export default {
  name: "replayList",
  components: {
    DetailList,
    APagination,
    Empty,
    EditText,
  },
  data() {
    return {
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
        course_id: {
          label: "相关课程",
          type: "text",
        },
        subject: {
          label: "直播主题",
          type: "text",
        },
        start_time: {
          label: "开始时间",
          type: "slot",
          slotName: "start_time",
        },
        duration: {
          label: "时长",
          type: "number",
        },
        repeat: {
          label: "重复",
          type: "select",
          list: [],
        },
        end_time: {
          label: "结束于",
          type: "date", // true
        },
        replay: {
          label: "回放",
          type: "switch",
        },
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
      getLiveMaps(["liveStatus", "repeat"]).then(map => {
        this.statusList = map.liveStatusMap;
        this.fieldsMap.repeat.list = map.repeatMap;
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
          this.tableList = res.pageBean.list;
          this.pagination.current = res.pageBean.currentPage;
          this.pagination.total = res.pageBean.allRow;
        })
        .finally(_ => {
          this.loading = false;
        });
    },
    gotoReplay(liveConfigId) {
      this.$router.push({
        name: "watch",
        params: { liveConfigId },
        query: { mode: "replay" },
      });
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
.tableItem {
  box-sizing: border-box;
  padding: 10px;
  margin-bottom: 20px;
  border: 1px solid #dedede;
  display: block;
  position: relative;
  &:hover {
    box-shadow: 2px 2px 3px #dedede;
  }
  p {
    margin-bottom: 0.3em;
  }
  .flag {
    margin-top: 10px;
    position: absolute;
    right: 0;
    top: 0;
    padding: 0 7px;
  }
  .frame {
    flex: 0 0 auto;
    width: 100%;
    height: 140px;
    text-align: center;
    position: relative;
    overflow: hidden;
    margin-right: 10px;
    background-color: #f0f0f0;
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-color: red;
    }
    .anticon {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: #fff;
      cursor: pointer;
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
</style>
