<script setup lang="ts">
import type { Room } from '@/types';
import { onMounted, ref } from 'vue';

// components
import RoomForm from './RoomForm.vue';

// stores
import { useRoomList } from '@/stores/roomList';
import { useBookingList } from "../stores/bookingListStore";


const roomListStore = useRoomList();
const bookingListStore = useBookingList();

// show addRoomForm or not
const addRoomFormIsShow = ref<boolean>(false);
function showAddRoomForm(): void{
    addRoomFormIsShow.value = !addRoomFormIsShow.value;
}

// finished later
function editRoomItem(id: string): void {
    if (roomIsUsing(id)) {
        console.log("Room is using or will use in the future. You can't edit the room. ");
        return;
    }else {
        // edit the room
    }
}

function deleteRoomItem(id: string): void{
    // 需要進行判斷，如果該會議室有未來預約，需要跳出警告或是禁止刪除
    console.log(id);
    console.log(bookingListStore.bookings);

   if(roomIsUsing(id)) {
    console.log("Room is using or will use in the future. You can't delete the room. ");
    return;
   }else {
    // delete the room
    roomListStore.deleteRoom(id);
    console.log('Room has been deleted!');
   }
}
function roomIsUsing(roomId: string): boolean{
    // 這邊對目前的 bookings 做 loop，去找目前的 room.id 是否有預約
    const now: number =  Date.now(); // today timestamp
    const room = bookingListStore.bookings.find( (el) => el.roomId === roomId && el.endTime > now );

    return room ? true : false;
}

</script>
<template>
    <div>
        <h2>會議室設定</h2>
        <ul>
            <li v-for="room in roomListStore.rooms">
                <span>{{ room.name }}</span>
                <span>{{ room.capacity }}</span>
                <ul>
                    <li v-for="equipment in room.equipments">{{ equipment }}</li>
                </ul>
                <button type="button" @click="editRoomItem(room.id)">編輯</button>
                <button type="button" @click="deleteRoomItem(room.id)">刪除</button>
            </li>
        </ul>
        <button type="button" @click="showAddRoomForm">建立會議室</button>
    </div>
    <RoomForm v-if="addRoomFormIsShow"></RoomForm>
    
</template>
