import UserInfor from "./UserInfor";
import RoomActions from "./RoomActions";
import SidebarTabs from "./SidebarTabs";
import SearchUser from "./SearchUser";
import type { UserItem } from "../../types/userType";
import "./sidebar.css";

type LeftSideProps = {
    me: string,
    selectedTarget: string | null,
    onSelectPeople: (name: string) => void,
    onSelectRoom: (name: string) => void,
    users?: UserItem[]
};

export default function LeftSideBar({me, users, selectedTarget, onSelectPeople, onSelectRoom}: LeftSideProps) {
    return (
        <div className="left-side-bar">
            <div className="sidebar-top-section">
                <UserInfor me={me} isOnline={true}/>
                <RoomActions onSelectRoom={onSelectRoom}/>
                <SearchUser
                    selectedTarget={selectedTarget}
                    onSelectPeople={onSelectPeople}
                />
            </div>

            <div className="sidebar-bottom-section">
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