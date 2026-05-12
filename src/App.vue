<script setup lang="ts">
// import { RouterLink, RouterView } from 'vue-router'
import { onMounted, onBeforeMount } from 'vue';
import { useRoomList } from './stores/roomList';
import RoomList from './components/RoomList.vue';
import BookingList from './components/BookingList.vue';
import { useBookingList } from './stores/bookingListStore';


// element plus

onMounted(async () => {
  // get initial rooms data
  const roomListStore = useRoomList();
  await roomListStore.fetchRooms();
  console.log("fetch rooms finished!")

  // get initial bookings data
  const bookingListStore = useBookingList();
  await bookingListStore.fetchBookings();
  console.log("fetch bookings finished!");
})



</script>

<template>
  <RoomList></RoomList>
  <BookingList></BookingList>
</template>

<style scoped>
</style>
