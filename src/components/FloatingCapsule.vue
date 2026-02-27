<template>
  <div class="floating-capsule" :class="{ 'is-dragging': isDragging, 'is-left': isLeft }" :style="capsuleStyle"
    @mousedown="startDrag">
    <div class="capsule-content">
      <div v-for="(item, index) in visibleItems" :key="index" class="capsule-item" @click="handleItemClick(item)"
        :title="item.title">
        <a-badge v-if="item.badge && (typeof item.badge === 'function' ? item.badge() : item.badge)" dot
          :offset="[0, 0]" :numberStyle="{ width: '8px', height: '8px', boxShadow: '0 0 0 1px #fff' }">
          <a-icon v-if="item.icon" :type="item.icon" class="item-icon" />
          <a-icon v-else-if="item.component" :component="item.component" class="item-icon" />
        </a-badge>
        <template v-else>
          <a-icon v-if="item.icon" :type="item.icon" class="item-icon" />
          <a-icon v-else-if="item.component" :component="item.component" class="item-icon" />
        </template>
      </div>
    </div>
    <div class="capsule-drag-handle" title="拖拽移动">
      <a-icon :component="dragIcon" class="drag-icon" />
    </div>
  </div>
</template>

<script>
import { drag } from "@/core/icons";

export default {
  name: 'FloatingCapsule',
  props: {
    items: {
      type: Array,
      default: () => []
    },
    initialPosition: {
      type: Object,
      default: () => ({ x: null, y: 50 })
    }
  },
  data() {
    return {
      isDragging: false,
      position: { x: null, y: 50 },
      dragOffset: { x: 0, y: 0 },
      isLeft: false,
      windowWidth: window.innerWidth,
      dragIcon: drag
    }
  },
  computed: {
    capsuleStyle() {
      const style = {
        top: `${this.position.y}px`,
        zIndex: 999
      }
      if (this.isLeft) {
        style.left = '20px'
      } else {
        style.right = '20px'
      }
      return style
    },
    visibleItems() {
      return this.items.filter(item => {
        if (typeof item.show === 'function') {
          return item.show()
        }
        return item.show !== false
      })
    }
  },
  mounted() {
    this.position.x = this.initialPosition.x
    this.position.y = this.initialPosition.y
    this.checkPosition()
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    handleResize() {
      this.windowWidth = window.innerWidth
      this.checkPosition()
    },
    checkPosition() {
      if (this.position.x !== null) {
        const centerX = this.windowWidth / 2
        this.isLeft = this.position.x < centerX
      } else {
        this.isLeft = false
      }
    },
    startDrag(e) {
      if (e.target.closest('.capsule-drag-handle')) {
        this.isDragging = true
        this.dragOffset.x = e.clientX - (this.position.x || this.windowWidth - 60)
        this.dragOffset.y = e.clientY - this.position.y

        document.addEventListener('mousemove', this.onDrag)
        document.addEventListener('mouseup', this.stopDrag)
        e.preventDefault()
      }
    },
    onDrag(e) {
      if (!this.isDragging) return

      let newX = e.clientX - this.dragOffset.x
      let newY = e.clientY - this.dragOffset.y

      newY = Math.max(0, Math.min(newY, window.innerHeight - 200))

      this.position.x = newX
      this.position.y = newY

      this.checkPosition()
    },
    stopDrag() {
      this.isDragging = false

      const centerX = this.windowWidth / 2
      if (this.position.x < centerX) {
        this.isLeft = true
        this.position.x = 20
      } else {
        this.isLeft = false
        this.position.x = null
      }

      document.removeEventListener('mousemove', this.onDrag)
      document.removeEventListener('mouseup', this.stopDrag)
    },
    handleItemClick(item) {
      if (item.onClick && typeof item.onClick === 'function') {
        item.onClick()
      }
      this.$emit('itemClick', item)
    }
  }
}
</script>

<style lang="less" scoped>
.floating-capsule {
  position: fixed;
  background: rgba(255, 255, 255, 0.6);
  box-sizing: border-box;
  border: 2px solid #fff;
  border-radius: 100px;
  box-shadow: -4px 0px 16px 0px rgba(0, 92, 173, 0.1);
  padding: 20px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  user-select: none;

  &.is-dragging {
    cursor: grabbing;
    box-shadow: -4px 0px 20px 0px rgba(0, 92, 173, 0.2);
  }

  &.is-left {
    box-shadow: 4px 0px 16px 0px rgba(0, 92, 173, 0.1);
  }

  &:hover {
    background-color: #fff;
  }
}

.capsule-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.capsule-item {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.05);
  }

  .item-icon {
    width: 28px;
    height: 28px;
    font-size: 28px;
  }

  .item-icon+.item-icon {
    margin-top: 16px;
  }
}

.capsule-drag-handle {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  margin-top: 16px;

  &:active {
    cursor: grabbing;
  }

  .drag-icon {
    width: 14px;
    height: 4px;
    fill: #999999;
  }

  &:hover .drag-icon {
    fill: #666666;
  }
}
</style>
