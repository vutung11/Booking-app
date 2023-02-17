import axios from "axios";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const regsiterUser = async (ev) => {
        ev.preventDefault()
        try {
            await axios.post('/register', {
                name,
                email,
                password
            });
            alert('Regisrer successfully')
        } catch (error) {
            alert('Register fail')
        }
    }
    return (
        <div className="mt-4 grow flex items-center justify-around">
            <div className="mb-64">
                <h1 className="text-4xl text-center mb-4">Register</h1>
                <form className="max-w-md mx-auto" onSubmit={regsiterUser}>
                    <h2></h2>
                    <input type="text"
                        placeholder="Tung vu"
                        name="name"
                        onChange={ev => setName(ev.target.value)} />
                    <input type="email"
                        placeholder="Your...@email.com"
                        name='email'
                        onChange={ev => setEmail(ev.target.value)} />
                    <input type="password"
                        placeholder="password"
                        name='password'
                        onChange={ev => setPassword(ev.target.value)} />
                    <button className="primary">Login</button>
                    <div className="text-center py-2 text-gray-500">
                        Already a member?
                        <Link className="underline text-black" to={'/login'}>Login</Link>
                    </div>
                </form>
            </div>

        </div>
    )
}