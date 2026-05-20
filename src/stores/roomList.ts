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
    rooms.value.push(room); // 現在將新增這個操作交給 Mock 處理， store 只負責呼叫 API 和 儲存資料。
    // await axios.post('/api/v1/rooms', room);
  }

  function deleteRoom(id: string): void{
    rooms.value = rooms.value.filter( (el) => el.id !== id);
  }

  function editRoom(roomId: string, updateData: Partial<Room>): void{
    const editRoom = rooms.value.find( (el) => el.id === roomId);
    if (!editRoom) {
      return;
    }
    Object.assign(editRoom, updateData);
  }

  return { rooms,  fetchRooms, addRoom, editRoom, deleteRoom };
});
