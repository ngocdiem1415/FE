import UserInfor from "./UserInfor";
import RoomActions from "./RoomActions";
import SidebarTabs from "./SidebarTabs";
import SearchUser from "./SearchUser";
import type {UserItem} from "../../types/userType";
import "./sidebar.css";
import {useNavigate} from "react-router-dom";
import {authService} from "../../services/authApi.ts";
import {APP_ROUTES} from "../../constants/routes.ts";
import {useCallback, useEffect, useState} from "react";

type LeftSideProps = {
    me: string,
    selectedTarget: string | null,
    onSelectPeople: (name: string) => void,
    onSelectRoom: (name: string) => void,
    users?: UserItem[]
};

export default function LeftSideBar({me, users, selectedTarget, onSelectPeople, onSelectRoom}: LeftSideProps) {
    const navigate = useNavigate();

    // 1. State quản lý độ rộng (mặc định 300px)
    const [width, setWidth] = useState(300);
    const [isResizing, setIsResizing] = useState(false);

    const startResizing = useCallback(() => {
        setIsResizing(true);
    }, []);

    // 3. Hàm kết thúc kéo
    const stopResizing = useCallback(() => {
        setIsResizing(false);
    }, []);

    // 4. Hàm xử lý khi đang di chuyển chuột
    const resize = useCallback((mouseMoveEvent: MouseEvent) => {
        if (isResizing) {
            // Giới hạn độ rộng tối thiểu 250px và tối đa 600px
            const newWidth = mouseMoveEvent.clientX;
            if (newWidth > 300 && newWidth < 500) {
                setWidth(newWidth);
            }
        }
    }, [isResizing]);

    useEffect(() => {
        window.addEventListener("mousemove", resize);
        window.addEventListener("mouseup", stopResizing);
        return () => {
            window.removeEventListener("mousemove", resize);
            window.removeEventListener("mouseup", stopResizing);
        };
    }, [resize, stopResizing]);

    const handleLogout = async () => {
        try {
            await authService.logout();
        } catch (error) {
            console.error("Logout failed", error);
        } finally {
            localStorage.clear();
            console.log(localStorage.getItem("user"))
            setTimeout(() => {
                navigate(APP_ROUTES.LOGIN, {replace: true});
            }, 2000);
            // navigate(APP_ROUTES.LOGIN, {replace: true});
        }
    };

    return (
        <div className="left-side-bar"
             style={{width: `${width}px`}}
        >
            <div className="sidebar-header">
                <UserInfor me={me} isOnline={true} className="my-profile"/>

                <button className="logout-btn-global" onClick={handleLogout} title="Logout">
                    <i className="fas fa-sign-out-alt"></i>
                </button>

            </div>

            <div className="sidebar-top-section">
                <SearchUser selectedTarget={selectedTarget} onSelectPeople={onSelectPeople}/>
                <RoomActions onSelectRoom={onSelectRoom}/>
            </div>
            <div className="sidebar-bottom-section">
                <SidebarTabs
                    users={users}
                    selectedTarget={selectedTarget}
                    onSelectPeople={onSelectPeople}
                    onSelectRoom={onSelectRoom}
                />
            </div>

            <div className="sidebar-resizer" onMouseDown={startResizing}/>
        </div>
    );
}