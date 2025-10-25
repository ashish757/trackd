import {useDispatch} from "react-redux";
import {clientLogout} from "../redux/authSlice.ts";

export default function Home() {
    const dispatch = useDispatch();



    const logoutHandler = () => {
            dispatch(clientLogout());
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
