<template>
  <div class="stat-card">
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
      type: [String, Number],
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
  background: linear-gradient(180deg, #FFFFFF 0%, rgba(255, 255, 255, 0) 100%), url(@/assets/icons/card@2x.png);
  background-size: cover;
  background-position: center;
  box-shadow: 0px 8px 16px 0px rgba(0, 68, 255, 0.08);
  border-radius: 8px;
  padding: 8px 20px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;
  overflow: hidden;

  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: space-around;
  position: relative;
  border: 1px solid #fff;
}

.stat-card:hover {
  box-shadow: 0px 12px 20px 0px rgba(0, 68, 255, 0.12);
  cursor: pointer;
}

.stat-text {
  flex: 0 0 7em;
}

.stat-title {
  font-size: 14px;
  font-weight: normal;
  line-height: 22px;
  color: #111111;
  margin-bottom: 4px;
}

.stat-value-container {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.stat-value {
  font-family: Rany;
  font-size: 24px;
  font-weight: 500;
  line-height: 32px;
  color: #111111;
}

.stat-unit {
  font-family: Rany;
  font-size: 14px;
  font-weight: normal;
  line-height: 22px;
  color: #111111;
}

.stat-icon {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
</style>