import './userAvatar.css'

interface UserInforProps {
    username?: string;
    isOnline: boolean;
    isExit: boolean;
}

const UserInfor = ({
                       username = localStorage.getItem('username') || 'Guest',
                       isOnline,
                       isExit
                   }: UserInforProps) => {

    return (
        <div className={`user-avatar ${!isExit ? 'user-not-exit' : ''}`}>
            <div className="avatar-wrapper">
                <img
                    src="/react.svg"
                    alt="avatar"
                    className={`avatar-img ${!isExit ? 'grayscale' : ''}`}
                />
                {/* Nếu isOnline là true thì thêm class 'online', ngược lại 'offline' */}
                <span className={`status-dot ${isOnline ? 'online' : 'offline'}`}></span>
            </div>

            <div className="user-text">
                <span className="user-name">{username}</span>
            </div>
        </div>
    )
}

export default UserInfor;