// import { UserItem } from "../../types/chatType";

type UserListProps = {
    // users: UserItem[];
    selectedTarget: string | null;
    onSelectPeople: (username: string) => void;
};

export default function ListUser({ users, selectedTarget, onSelectPeople }: UserListProps) {
    const userOnly = users.filter(item => item.type === 0);

    return (
        <div className="list-section">
            <div className="scroll-box" style={{ maxHeight: "400px", overflowY: "auto" }}>
                {userOnly.map((user) => (
                    <div
                        key={user.name}
                        onClick={() => onSelectPeople(user.name)}
                        style={{
                            padding: "12px",
                            marginBottom: "8px",
                            borderRadius: "8px",
                            cursor: "pointer",
                            border: "1px solid",
                            borderColor: selectedTarget === user.name ? "#4f46e5" : "#eee",
                            backgroundColor: selectedTarget === user.name ? "#f5f7ff" : "#fff"
                        }}
                    >
                        <div style={{ fontWeight: 700 }}>{user.name}</div>
                        <div style={{ fontSize: "11px", color: "#999" }}>{user.actionTime}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}