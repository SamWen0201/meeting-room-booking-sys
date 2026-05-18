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

    function addBooking(booking: Booking): void{
        bookings.value.push(booking);
        console.log(bookings.value)
        console.log("booking is added!");
    }

    return {bookings, fetchBookings, addBooking}
})