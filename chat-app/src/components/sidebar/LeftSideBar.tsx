// src/components/sidebar/LeftSideBar.tsx
import UserInfor from "./UserInfor";
import RoomActions from "./RoomActions";
import SidebarTabs from "./SidebarTabs";
import SearchUser from "./SearchUser.tsx";
import type { UserItem } from "../../types/userType";

type Props = {
    me: string,
    selectedTarget: string | null,
    onSelectPeople: (name: string) => void,
    onSelectRoom: (name: string) => void,
    users?: UserItem[]
};

export default function LeftSideBar({me, users, selectedTarget, onSelectPeople, onSelectRoom}: Props) {
    return (
        <div style={{
            width: 320,
            display: "flex",
            flexDirection: "column",
            height: "100vh",
            borderRight: "1px solid #ddd"
        }}>
            <div style={{padding: 16}}>
                <UserInfor me={me} isOnline={true}/>
                <RoomActions onSelectRoom={onSelectRoom}/>
                <SearchUser/>
            </div>

            {/* Phần nhúng Tabs mới vào đây */}
            <div style={{flex: 1, minHeight: 0, padding: "0 16px"}}>
                <SidebarTabs
                    users={users}
                    selectedTarget={selectedTarget}
                    onSelectPeople={onSelectPeople}
                    onSelectRoom={onSelectRoom}
                />
            </div>
        </div>
    );
}