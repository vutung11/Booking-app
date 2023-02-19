import { useEffect, useState } from "react";
import PhotosUploader from './PhotosUploader';
import Perks from './Perks';
import axios from "axios";
import { useLocation, useParams } from "react-router-dom";

export default function PlacesFormPage() {

    const { id } = useParams()

    console.log(id)

    const [title, setTitle] = useState('')
    const [address, setAddress] = useState('');
    const [addPhotos, setAddPhotos] = useState([]);
    const [description, setDescription] = useState('');
    const [perks, setPerks] = useState([]);
    const [extraInfo, setExtraInfo] = useState('');
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [maxGuest, setMaxGuest] = useState(1);


    const [redirect, setRedirect] = useState(false)

    const inputHeader = (text) => {
        return (
            <h2 className="text-2xl mt-4">{text}</h2>
        )
    }
    const inputDescription = (text) => {
        return (
            <p className="text-gray-500 text-sm">{text}</p>
        )
    }
    const preInput = (header, description) => {
        return (
            <>
                {inputHeader(header)}
                {inputDescription(description)}
            </>
        )
    }

    useEffect(() => {

        if (!id) {
            return;
        } else {
            axios.get('/places/' + id).then(response => {
                const { data } = response;
                setTitle(data.title);
                setAddress(data.address);
                setAddPhotos(data.photos);
                setDescription(data.description);
                setPerks(data.perks);
                setExtraInfo(data.extraInfo);
                setCheckIn(data.checkIn);
                setCheckOut(data.checkOut);
                setMaxGuest(data.maxGuest);
            })
        }
    }, [id])

    const addNewPlace = async (ev) => {
        ev.preventDefault();
        console.log(addPhotos)
        await axios.post('/places', {
            title,
            address,
            addPhotos,
            description,
            perks,
            extraInfo,
            checkIn,
            checkOut,
            maxGuest
        });

        setRedirect('/account/places')
    }

    return <div>
        <form onSubmit={addNewPlace}>
            {preInput('Title', 'Title your place')}
            <input type="text"
                value={title}
                onChange={ev => setTitle(ev.target.value)}
                placeholder="title, for example: My love place" />
            {preInput('Address', 'Address your place')}
            <input type="text"
                value={address}
                onChange={ev => setAddress(ev.target.value)}
                placeholder="title, for example: My love place" />
            {preInput('Photos', 'more = better')}

            <PhotosUploader addPhotos={addPhotos} onChange={setAddPhotos} />

            {preInput('Description', 'Description')}
            <textarea
                value={description}
                onChange={ev => setDescription(ev.target.value)}
            />
            <h2 className="text-2xl mt-4">Perks</h2>
            <p className="text-gray-500 text-sm">Select all the perks service</p>
            <div className="grid mt-2 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
                <Perks selected={perks} onChange={setPerks} />
            </div>
            {preInput('Extra info', 'Extra info your place')}
            <textarea
                value={extraInfo}
                onChange={ev => setExtraInfo(ev.target.value)}
            />
            {preInput('Check in&out time & max guest', 'Extra info your place')}
            <div className="grid gap-2 sm:grid-cols-3">
                <div>
                    <h3 className="mt-2 -mb-1">Check in time</h3>
                    <input type="text"
                        value={checkIn}
                        onChange={ev => setCheckIn(ev.target.value)}
                        placeholder="16:00" />
                </div>
                <div>
                    <h3 className="mt-2 -mb-1">Check out time</h3>
                    <input type="text"
                        value={checkOut}
                        onChange={ev => setCheckOut(ev.target.value)}
                        placeholder="12:00" />
                </div>
                <div>
                    <h3 className="mt-2 -mb-1">Max guest</h3>
                    <input type="number"
                        value={maxGuest}
                        onChange={ev => setMaxGuest(ev.target.value)}
                        placeholder="2" />
                </div>
            </div>
            <button className="primary my-4">Save</button>
        </form>
    </div>
}