import { defineStore } from "pinia";
import { ref } from "vue";

export const useRoomList = defineStore("roomList", () => {
  const rooms = ref([]);

  function addRoom(room) {
    rooms.value.push(room);
    console.log("Room add success!");
    console.log(rooms.value);
  }

  return { rooms, addRoom };
});
