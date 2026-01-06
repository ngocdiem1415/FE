import type { UserItem } from "../../types/userType";
import "./listStyles.css";

type UserListProps = {
    users: UserItem[];
    selectedTarget: string | null;
    onSelectPeople: (username: string) => void;
};

export default function ListUser({ users, selectedTarget, onSelectPeople }: UserListProps) {
    const userOnly = users.filter(item => item.type === 0);

    return (
        <div className="list-section">
            <div className="scroll-box">
                {userOnly.map((user) => (
                    <div
                        key={user.name}
                        onClick={() => onSelectPeople(user.name)}
                        className={`list-item is-user ${selectedTarget === user.name ? 'active' : ''}`}>
                        <div className="item-name">{user.name}</div>
                        <div className="item-time">{user.actionTime}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}