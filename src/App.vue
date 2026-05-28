<!-- <script setup lang="ts">
// import { RouterLink, RouterView } from 'vue-router'
import { onMounted, ref } from "vue";
import { useRoomList } from "./stores/roomList";
import { useBookingList } from "./stores/bookingListStore";
import { useUser } from "./stores/userStore";

// import route
import { useRoute } from "vue-router";

const route = useRoute();

// test element plus components

// element plus

const dataIsReady = ref<boolean>(false);
const roomListStore = useRoomList();
const bookingListStore = useBookingList();
const userStore = useUser();

onMounted(async () => {
  // get initial rooms data
  
  await roomListStore.fetchRooms();
  console.log("fetch rooms finished!");

  // get initial bookings data
  
  await bookingListStore.fetchBookings();
  console.log("fetch bookings finished!");

  // get initial users data
  
  await userStore.fetchUsers();
  console.log('fetch users finished!');

  dataIsReady.value = true;
});
</script>

<template>
  <el-container class="whole-container">
    <el-aside class="aside" v-if="userStore.isLoggedIn">
      <nav class="nav">
        <RouterLink to="/" class="nav__link">日程總覽</RouterLink>
        <RouterLink to="/room-management" class="nav__link" v-if="userStore.isAdmin"
          >會議室維護</RouterLink
        >
      </nav>
    </el-aside>
    <el-container>
      <el-header class="header" v-if="userStore.isLoggedIn">
        <h1 class="heading-primary">
          {{ route.meta.title }}
        </h1>
      </el-header>
      <el-main class="main">
        <RouterView v-if="dataIsReady"></RouterView>
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped lang="scss">
@use "../src/assets/variables" as *;

.aside {
  background-color: $color-slidebar;
  height: 100vh;
  width: 24rem;
}

.nav {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
  font-size: $font-size-section;
  padding: $spacing-md;
  &__link {
    color: $color-border;
    text-decoration: none;
    transition: all .3s;
    border-radius: 2px;
    padding: $spacing-xs;
    &.router-link-exact-active {
      background-color: $color-primary-blue;
      transform: scale(1.05);
    }
  }
}
.header {
  padding: $spacing-lg;
  height: auto;
}

@media (max-width: 75em) { // 1200px
  .whole-container {
    display: flex;
    flex-direction: column;
  }

  .aside {
    height: auto;
    width: 100%;
  }

  .nav {
    flex-direction:row;
  }
}


</style> -->

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoomList } from "./stores/roomList";
import { useBookingListStore } from "./stores/bookingList";
import { useUser } from "./stores/userStore";

const dataIsReady = ref<boolean>(false);
const roomListStore = useRoomList();
const bookingListStore = useBookingListStore();
const userStore = useUser();

onMounted(async () => {
  await roomListStore.fetchRooms();
  await bookingListStore.fetchBookings();
  await userStore.fetchUsers();
  dataIsReady.value = true;
});
</script>

<template>
  <RouterView v-if="dataIsReady"></RouterView>
</template>
