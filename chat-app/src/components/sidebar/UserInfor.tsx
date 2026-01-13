import './userInfor.css';

interface UserInforProps {
    me: string;
    isOnline: boolean;
    className?: string; // Thêm để tùy chỉnh CSS linh hoạt
}

export default function UserInfor({me, isOnline, className = ""}: UserInforProps) {
    return (
        <div className={`user-container ${className}`}>
            <div className="avatar-wrapper">
                <img src="/img/avatar.jpg" alt="avatar"/>
                {isOnline && <span className="status-dot online"></span>}
            </div>
            <div className="user-name" title={me}>{me}</div>
        </div>
    );
}