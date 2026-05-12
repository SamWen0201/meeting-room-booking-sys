import { defineStore } from "pinia";
import { ref } from "vue";
import type { Booking } from "@/types";
import axios from "axios";

export const useBookingList = defineStore('bookingList', () => {
    const bookings = ref<Booking[]>([]);

    async function fetchBookings(){
        const bookingsData = await axios.get('/api/v1/bookings');
        bookings.value = bookingsData.data;
    }

    function addBooking(){}

    return {bookings, fetchBookings,}
})