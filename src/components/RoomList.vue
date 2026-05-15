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

// // show addRoomForm or not
// const addRoomFormIsShow = ref<boolean>(false);
// function showAddRoomForm(): void{
//     addRoomFormIsShow.value = !addRoomFormIsShow.value;
// }

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
    // 作法就是如果該會議的結束時間 小於 now ，那就代表這個會議室 不是 正在使用 就是 未來將要被使用
    const now: number =  Date.now(); // today timestamp
    const room = bookingListStore.bookings.find( (el) => el.roomId === roomId && el.endTime > now );

    return room ? true : false;
}

// control dialoag
const dialogRoomFormVisible = ref<boolean>(false);
function handleCloseDialoagRoomForm(): void {
  dialogRoomFormVisible.value = false;
}

</script>
<template>
    <div class="roomlist">
        <el-row justify="space-between">
            <span>
                會議室設定
            </span>

            <el-button type="primary" color="#3B82F6" @click="dialogRoomFormVisible = true">
                <span class="u-margin-right-sm u-flex-center">
                    <el-icon><Plus /></el-icon>
                </span>
                
                建立會議室
            </el-button>
        </el-row>
        
        <el-table :data="roomListStore.rooms" style="width: 100%">
            <el-table-column prop="name" label="名稱" />
            <el-table-column prop="capacity" label="名稱" width="180" />
            <el-table-column prop="equipments" label="設備" width="180" />
            <el-table-column label="操作" width="180">
                <template #default="scope">
                    <el-button size="small" type="primary" color="#3B82F6" @click="editRoomItem(scope.row.id)" >
                        <span class="u-margin-right-sm u-flex-center">
                            <el-icon><Edit /></el-icon>
                        </span>
                        編輯
                    </el-button>
                    <el-button size="small" type="danger" color="#EF4444" @click="deleteRoomItem(scope.row.id)">
                         <span class="u-margin-right-sm u-flex-center">
                            <el-icon><Delete /></el-icon>
                        </span> 
                        刪除
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
        
    </div>
    <el-dialog 
      v-model="dialogRoomFormVisible"
      title="建立會議室"
      destroy-on-close
    >
        <RoomForm @closeDialoagRoomForm="handleCloseDialoagRoomForm"></RoomForm>
    </el-dialog>
    
</template>
<style lang="scss" scoped>
@use '../assets/variables' as *;
.roomlist {
    background-color: #fff;
    padding: $spacing-md;
    border-radius: 3px;
    box-shadow: 0 1px 2px rgba(#000, .3);
    font-size: $font-size-body;
} 
</style>
