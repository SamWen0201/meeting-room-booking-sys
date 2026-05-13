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
  


  function addRoom(room: Room): void {
    rooms.value.push(room);
    console.log("Room add success!");
    console.log(rooms.value);
  }

  function deleteRoom(id: string): void{
    rooms.value = rooms.value.filter( (el) => el.id !== id);
  }

  function editRoom(){
  }

  return { rooms, addRoom, fetchRooms, deleteRoom };
});
