<script setup lang="ts">
import type { Room } from '@/types';
import { ref, reactive } from 'vue';

// components
import RoomForm from './RoomForm.vue';

// stores
import { useRoomList } from '@/stores/roomList';
import { useBookingList } from "../stores/bookingListStore";

// import notification
import { ElNotification } from 'element-plus'


const roomListStore = useRoomList();
const bookingListStore = useBookingList();

// // show addRoomForm or not
// const addRoomFormIsShow = ref<boolean>(false);
// function showAddRoomForm(): void{
//     addRoomFormIsShow.value = !addRoomFormIsShow.value;
// }


// 儲存 目前點選編輯的會議室資料，在之後要傳給 RoomForm
// 既然這只是需要一次傳值?是否需要建立成 state，需要? 因為當使用者點選編輯其他資料的時候，資料同時也要轉變?

// 思考問題，要怎麼讓 RoomForm 知道，現在是新增還是編輯，因為目前在 RoomForm 如果點下確認新增，是會新增一個會議室，而不是更新 
// 檢查目前的狀態有沒有 roomId ，因為 roomId 是新增之後才有的
// 因為在 RoomForm 裡面 更新模式是透過有沒有接收到 父元素傳遞 editData 這個 prop 來決定的，所以在 RoomForm 裡面更新完畢之後要記得清空 editData

const roomEditData = reactive<Room>({
    id: '', 
    name: '', 
    capacity: 0, 
    equipments:[]});

function editRoomItem(id: string): void {
    if (roomIsUsing(id)) {
        console.log("Room is using or will use in the future. You can't edit the room. ");

        // Warnning notification
        ElNotification({
            title: 'Warning',
            message: '該會議室有未來預約，無法編輯!',
            duration: 3000,
            type: 'warning',
            position: 'bottom-right'
        })

        return;
    }else {
        // edit the room
        const editRoom = roomListStore.rooms.find( (el) => el.id === id);
        Object.assign(roomEditData, editRoom);

        dialogRoomFormVisible.value = true; // open the dialog

        // 因為 RoomForm 是子元素，所以這邊打開表格之後沒有辦法將目前表格的狀態填入表格
        // 其實應該可以? 只是需要將屬性傳遞下去
    }
}

function resetRoomEditData(): void {
    roomEditData.id = '';
    roomEditData.name = '';
    roomEditData.capacity = 0;
    roomEditData.equipments = [];

    console.log(roomEditData);
}

function deleteRoomItem(id: string): void{
    // 需要進行判斷，如果該會議室有未來預約，需要跳出警告或是禁止刪除
    console.log(id);
    console.log(bookingListStore.bookings);

   if(roomIsUsing(id)) {
    console.log("Room is using or will use in the future. You can't delete the room. ");

    // Warnning notification
    ElNotification({
        title: 'Warning',
        message: '該會議室有未來預約，無法刪除!',
        duration: 3000,
        type: 'warning',
        position: 'bottom-right'
    })

    return;
   }else {
    // delete the room
    roomListStore.deleteRoom(id);
    console.log('Room has been deleted!');

    // Warnning notification
    ElNotification({
        title: 'Success',
        message: '刪除成功',
        duration: 3000,
        type: 'success',
        position: 'bottom-right'
    })
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
            <el-table-column prop="capacity" label="人數" width="180" />
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
      :title="`${roomEditData.id ? '編輯會議室' : '建立會議室'}`"
      destroy-on-close
      @close="resetRoomEditData"
      class="room-form"
    >
        <RoomForm @closeDialoagRoomForm="handleCloseDialoagRoomForm" :editData="roomEditData"></RoomForm>
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
