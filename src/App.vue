<script setup lang="ts">
// import { RouterLink, RouterView } from 'vue-router'
import { onMounted, ref } from 'vue';
import { useRoomList } from './stores/roomList';
import RoomList from './components/RoomList.vue';
import BookingList from './components/BookingList.vue';
import { useBookingList } from './stores/bookingListStore';
import Schedule from './components/Schedule.vue';


// element plus

const dataIsReady = ref<boolean>(false);

onMounted(async () => {
  // get initial rooms data
  const roomListStore = useRoomList();
  await roomListStore.fetchRooms();
  console.log("fetch rooms finished!")

  // get initial bookings data
  const bookingListStore = useBookingList();
  await bookingListStore.fetchBookings();
  console.log("fetch bookings finished!");

  dataIsReady.value = true;
})



</script>

<template>
  <div>
    <RoomList></RoomList>
    <BookingList></BookingList>
    <Schedule v-if="dataIsReady"></Schedule>
  </div>
</template>

<style scoped>
</style>
