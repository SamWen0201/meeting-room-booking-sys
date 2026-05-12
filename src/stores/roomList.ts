import { defineStore } from "pinia";
import { ref } from "vue";
import type { Room } from "@/types";



export const useRoomList = defineStore("roomList", () => {
  const rooms = ref<Room[]>([]);

  function addRoom(room: Room) {
    rooms.value.push(room);
    console.log("Room add success!");
    console.log(rooms.value);
  }

  return { rooms, addRoom };
});
