<script setup lang="ts">
import { ref } from "vue";
import { useRoomList } from "@/stores/roomList";

const roomListStore = useRoomList();

// bookingForm state
const name = ref("");
const capacity = ref(10);
const equipments = ref([]);

function addRoom() {
  roomListStore.addRoom({
    name: name.value,
    capacity: capacity.value,
    equipments: equipments.value,
  });

  name.value = "";
  capacity.value = 0;
  equipments.value = [];
}
</script>
<template>
  <form action="#" @submit.prevent>
    <label for="name">會議室名稱:</label>
    <input v-model="name" id="name" />
    <label for="capacity">容納人數:</label>
    <input type="text" v-model.number="capacity" id="capacity" />

    <div>設備:</div>
    <input
      type="checkbox"
      v-model="equipments"
      value="whiteboard"
      id="whiteboard"
    />
    <label for="whiteboard">白板</label>
    <input
      type="checkbox"
      v-model="equipments"
      value="projecter"
      id="projecter"
    />
    <label for="projecter">投影機</label>
    <input type="checkbox" v-model="equipments" value="pen" id="pen" />
    <label for="pen">雷射筆</label>

    <button @click="addRoom">確認新增</button>
  </form>
</template>
