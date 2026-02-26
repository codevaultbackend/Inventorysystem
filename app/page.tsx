import Link from "next/link";
import Sidebar from "./Component/Sidebar";
import Topbar from "./Component/Topbar";

export default function Home() {
    return (
        <div className="flex flex-col justify-center items-center min-h-screen bg-[#242425]">
            <h3 className="text-3xl text-white my-4.5">Login in Your IMS Dashboard</h3>
            <Link href='/Login' className="h-[50px] w-[120px] bg-white rounded-2xl flex justify-center items-center"><button>Login</button></Link>

        </div>
    );
}

