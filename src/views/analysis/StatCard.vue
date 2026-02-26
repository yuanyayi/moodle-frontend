<template>
  <div class="stat-card">
    <div class="stat-content">
      <div class="stat-text">
        <div class="stat-title">{{ title }}</div>
        <div class="stat-value-container">
          <span class="stat-value">{{ value }}</span>
          <span class="stat-unit">{{ unit }}</span>
        </div>
      </div>
      <div class="stat-icon">
        <img :src="iconSrc" :alt="title" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StatCard',
  props: {
    title: {
      type: String,
      required: true
    },
    value: {
      type: String,
      required: true
    },
    unit: {
      type: String,
      default: ''
    },
    icon: {
      type: String,
      required: true
    }
  },
  computed: {
    iconSrc() {
      return require(`@/assets/icons/${this.icon}@2x.png`);
    }
  }
};
</script>

<style scoped>
.stat-card {
  background: linear-gradient(180deg, #FFFFFF 0%, rgba(255, 255, 255, 0) 100%);
  box-shadow: 0px 8px 16px 0px rgba(0, 68, 255, 0.08);
  border-radius: 8px;
  padding: 20px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;
  overflow: hidden;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0px 12px 20px 0px rgba(0, 68, 255, 0.12);
}

.stat-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 1;
}

.stat-text {
  flex: 1;
  padding-right: 20px;
}

.stat-title {
  font-size: 14px;
  color: #666;
  font-weight: 400;
  margin-bottom: 8px;
}

.stat-value-container {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.stat-unit {
  font-size: 14px;
  color: #666;
  font-weight: 400;
}

.stat-icon {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F7FAFE;
  border-radius: 0 8px 8px 0;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
}

.stat-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
</style>