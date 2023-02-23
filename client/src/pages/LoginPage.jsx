import axios from "axios";
import { useContext, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { UserContext } from "../UserContext";

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [redirect, setRedirect] = useState(false);

    const { setUser } = useContext(UserContext);

    const handleLoginSubmit = async (ev) => {
        ev.preventDefault();
        try {
            const { data } = await axios.post('/login', { email, password });
            setUser(data);
            alert('Login successfully');
            setRedirect(true);
        } catch (error) {
            alert('Login faile');
        }
    }

    if (redirect) {
        return <Navigate to={'/'} />
    }

    return (
        <div className="mt-4 grow flex items-center justify-around">
            <div className="mb-64">
                <h1 className="text-4xl text-center mb-4">Login</h1>
                <form className="max-w-md mx-auto" onSubmit={handleLoginSubmit}>
                    <h2></h2>
                    <input type="email"
                        placeholder="Your...@email.com"
                        name="email"
                        onChange={ev => setEmail(ev.target.value)}
                    />
                    <input type="password"
                        placeholder="password"
                        name="password"
                        onChange={ev => setPassword(ev.target.value)}
                    />
                    <button className="primary">Login</button>
                    <div className="text-center py-2 text-gray-500">
                        Don't have an account yet?
                        <Link className="underline text-black" to={'/register'}>Register</Link>
                    </div>
                </form>
            </div>

        </div>
    )
}