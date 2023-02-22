import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom"
import AddressLink from "./AddressLink";
import BookingDates from "./BookingDates";
import PlaceGallery from "./PlaceGallery";

export default function BookingPage() {
    const { id } = useParams();
    const [booking, setBooking] = useState(null);

    useEffect(() => {
        if (id) {
            axios.get('/bookings').then(response => {
                const foundBooking = response.data.find(({ _id }) => _id === id);
                if (foundBooking) {
                    setBooking(foundBooking);
                }
            })
        }
    }, [id]);

    if (!booking) {
        return ''
    }
    return (
        <div className="my-8">
            <h1 className="text-3xl">{booking.place.title}</h1>
            <AddressLink className='my-2 block'>{booking.place.address}</AddressLink>
            <div className="bg-gray-200 p-6 my-6 rounded-2xl flex items-center justify-between">
                <div>
                    <h2 className="text-2xl mb-4">Your booking infomation</h2>
                    <BookingDates booking={booking} className='mb-2 mt-4 text-gray-500' />
                </div>
                <div className="bg-primary p-6 text-white rounded-2xl">
                    <div>
                        Total prive
                    </div>
                    <div className="text-3xl ">${booking.price}</div>
                </div>

            </div>
            <PlaceGallery place={booking.place} />
        </div>
    )
}