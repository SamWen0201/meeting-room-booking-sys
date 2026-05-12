import { defineStore } from "pinia";
import { ref } from "vue";
import type { Room } from "@/types";

// import mock, axios
import "../mock/index";
import axios from "axios";



export const useRoomList = defineStore("roomList", () => {
  const rooms = ref<Room[]>([]);

  async function fetchRooms(){
    const roomsData = await axios.get('/api/v1/rooms');
    rooms.value = roomsData.data;
  }
  


  function addRoom(room: Room) {
    rooms.value.push(room);
    console.log("Room add success!");
    console.log(rooms.value);
  }

  function deleteRoom(){
    // 需要進行判斷，如果該會議室有未來預約，需要跳出警告或是禁止刪除
    
  }

  function editRoom(){
  }

  return { rooms, addRoom, fetchRooms };
});
