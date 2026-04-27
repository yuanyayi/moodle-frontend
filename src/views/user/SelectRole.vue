<template>
  <div class="select-role-container">
    <div class="select-role-card">
      <h2 class="title">选择您的角色</h2>
      <p class="subtitle">请选择您要使用的身份继续访问</p>

      <div v-if="loading" class="loading-state">
        <a-spin size="large" />
        <p>加载中...</p>
      </div>

      <div v-else-if="error" class="error-state">
        <a-icon type="exclamation-circle" theme="filled" />
        <p>{{ error }}</p>
      </div>

      <a-row v-else-if="availableRoles.length > 0" class="role-list" :gutter="12">
        <a-col span="12" v-for="role in availableRoles" :key="role.value">
          <div class="role-item" :class="{ selected: selectedRoleId === role.value }" @click="handleRoleSelect(role)">
            <div class="role-info">
              <div class="role-name">{{ role.name }}</div>
            </div>
            <div class="role-check" v-if="selectedRoleId === role.value">
              <a-icon type="check-circle" />
            </div>
          </div>
        </a-col>
      </a-row>

      <div class="action-area" v-if="selectedRoleId && !loading && !error">
        <a-button type="primary" size="large" :loading="submitting" @click="confirmRole"> 确认并继续 </a-button>
      </div>
    </div>
  </div>
</template>

<script>
import storage from "store";
import { ACCESS_TOKEN } from "@/store/mutation-types";
import store from "@/store";
import { getSelectableRoles, generateToken } from "@/api/login";

export default {
  name: "SelectRole",
  data() {
    return {
      loading: false,
      submitting: false,
      error: "",
      selectedRoleId: "",
      availableRoles: [],
      userId: "",
      liveConfigId: "",
      token: "",
    };
  },
  created() {
    this.init();
  },
  methods: {
    async init() {
      // 从 URL query 获取参数
      this.userId = this.$route.query.userId || "";
      this.token = this.$route.query.token || "";
      this.liveConfigId = this.$route.query.liveConfigId || "";

      // 参数校验
      if (!this.userId && !this.token) {
        // 两个参数都没有，跳转到登录页
        this.$router.push({
          path: "/user/login",
          query: { redirect: this.$route.fullPath },
        });
        return;
      }

      if (this.token && !this.userId) {
        // 只有 token，没有 userId，返回首页
        this.redirectToDefaultPage();
        return;
      }

      if (this.userId && !this.token) {
        // 只有 userId，没有 token，返回登录页
        this.$router.push({
          path: "/user/login",
          query: { redirect: this.$route.fullPath },
        });
        return;
      }

      // 参数齐全，获取可用角色列表
      await this.fetchAvailableRoles();
    },

    async fetchAvailableRoles() {
      this.loading = true;
      this.error = "";

      try {
        // 调用后端接口获取可用角色列表
        const response = await getSelectableRoles(this.userId, this.token);

        if (response && response.data) {
          // 后端返回格式可能为对象：{ "2": "教师", "4": "助教" }
          // 需要转换为数组格式以匹配模板中的 v-for 和 role.value
          const rolesData = response.data;

          // 检查返回的是否为对象格式且非数组
          if (rolesData && typeof rolesData === "object" && !Array.isArray(rolesData)) {
            this.availableRoles = Object.keys(rolesData).map(key => ({
              value: parseInt(key),
              name: rolesData[key],
            }));
          } else {
            // 如果后端直接返回数组或其他格式，尝试直接使用或置空
            this.availableRoles = Array.isArray(rolesData) ? rolesData : [];
          }

          // 如果 availableRoles 为空，返回首页
          if (this.availableRoles.length === 0) {
            this.redirectToDefaultPage();
            return;
          }
        } else {
          throw new Error("获取角色列表失败");
        }
      } catch (error) {
        console.error("获取可用角色失败:", error);
        this.error = "获取角色列表失败，请重试";
      } finally {
        this.loading = false;
      }
    },

    handleRoleSelect(role) {
      this.selectedRoleId = role.value;
    },

    async confirmRole() {
      if (!this.selectedRoleId) {
        this.$message.warning("请选择一个角色");
        return;
      }

      this.submitting = true;

      try {
        // 调用接口获取新角色的 token
        const response = await generateToken(this.userId, this.selectedRoleId);

        if (response && response.data && response.data.token) {
          const newToken = response.data.token;
          storage.set(ACCESS_TOKEN, newToken, new Date().getTime() + 7 * 24 * 60 * 60 * 1000);
          store.commit("SET_ROLES", []);
          this.$router.push({ query: { token: newToken } });

          this.$nextTick(_ =>
            this.$router.push({
              // -- 学生 老师 教务 助教
              name: ["", "liveList", "broadcast", "liveList", "helpLive"][this.selectedRoleId],
              params: {
                liveConfigId: this.liveConfigId,
              },
              query: {
                token: newToken,
              },
            }),
          );
        } else {
          throw new Error("获取Token失败");
        }
      } catch (error) {
        console.error("切换角色失败:", error);
        this.$message.error("切换角色失败，请重试");
      } finally {
        this.submitting = false;
      }
    },

    redirectToDefaultPage() {
      this.$router.push({ name: "index" });
    },
  },
};
</script>

<style lang="less" scoped>
.select-role-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.select-role-card {
  background: white;
  border-radius: 16px;
  padding: 48px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  max-width: 600px;
  width: 90%;
}

.title {
  text-align: center;
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.subtitle {
  text-align: center;
  font-size: 14px;
  color: #999;
  margin: 0 0 32px 0;
}

.loading-state,
.error-state {
  text-align: center;
  padding: 40px 0;

  i {
    font-size: 48px;
    margin-bottom: 16px;
  }

  p {
    font-size: 16px;
    color: #666;
    margin: 0;
  }
}

.error-state {
  i {
    color: #ff4d4f;
  }
}

.role-list {
  display: flex;
  margin-bottom: 32px;
}

.role-item {
  display: flex;
  align-items: center;
  padding: 20px;
  border: 2px solid #e8e8e8;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    border-color: #667eea;
    background: #f8f9ff;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
  }

  &.selected {
    border-color: #667eea;
    background: #f0f2ff;
  }
}

.role-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  margin-right: 16px;
  flex-shrink: 0;

  i {
    font-size: 24px;
    color: white;
  }
}

.role-info {
  flex: 1;
}

.role-name {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.role-check {
  margin-left: 16px;

  i {
    font-size: 24px;
    color: #667eea;
  }
}

.action-area {
  text-align: center;
}
</style>
