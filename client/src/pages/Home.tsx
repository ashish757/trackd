import {useLogoutMutation} from "../redux/auth/authApi.ts";

export default function Home() {
    const [logout] = useLogoutMutation();


    const logoutHandler = async () => {
        await logout({ refreshToken: localStorage.getItem('refreshToken') });
    }


    return (
        <main>
            <div className="container">
                Logged in
            </div>
            <button onClick={logoutHandler}>Log Out</button>
        </main>
    )


}
