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


    function editBooking(bookingId: string, updatedData: Partial<Booking>): void {
        const editBooking = bookings.value.find( (el) => el.id === bookingId);
        if (!editBooking) {
            return;
        }
        Object.assign(editBooking, updatedData);
    }

    function deleteBooking(bookingId: string): void {
        if (!bookingId){
            return;
        }
        bookings.value = bookings.value.filter( (el) => (el.id !== bookingId));
    }

    return {bookings, fetchBookings, addBooking, editBooking, deleteBooking}
})