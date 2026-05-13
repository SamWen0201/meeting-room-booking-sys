<script setup lang="ts">
import { onMounted, ref } from "vue";

// stores
import { useRoomList } from "@/stores/roomList";

const roomListStore = useRoomList();

// bookingForm state
const name = ref("");
const capacity = ref(10);
const equipments = ref([]);

function addRoom():void {
  if(roomFormIsValid()) {
    const id = ref(crypto.randomUUID());
    roomListStore.addRoom({
    id: id.value,
    name: name.value,
    capacity: capacity.value,
    equipments: equipments.value,
  });
    name.value = "";
    capacity.value = 0;
    equipments.value = [];
  }else {
    return;
  }

  
}

function roomFormIsValid(): boolean {
  if (name.value === "" || (capacity.value < 0 && typeof capacity.value !== "number")) {
    return false;
  }
  return true;
}
</script>
<template>
  <form action="#" @submit.prevent="addRoom">
    <label for="name">會議室名稱:</label>
    <input v-model="name" id="name" required/>
    <label for="capacity">容納人數:</label>
    <input type="number" min="0" v-model.number="capacity" id="capacity" required/>

    <div>設備:</div>
    <input
      type="checkbox"
      v-model="equipments"
      value="白板"
      id="whiteboard"
    />
    <label for="whiteboard">白板</label>
    <input
      type="checkbox"
      v-model="equipments"
      value="投影機"
      id="projecter"
    />
    <label for="projecter">投影機</label>
    <input type="checkbox" v-model="equipments" value="雷射筆" id="pen" />
    <label for="pen">雷射筆</label>

    <button>確認新增</button>
  </form>
</template>
