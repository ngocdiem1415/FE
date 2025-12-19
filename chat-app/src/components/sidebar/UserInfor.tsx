import './userAvatar.css'

const UserInfor = () => {
    const username = localStorage.getItem('username') || 'Guest'

    return (
        <div className="user-avatar">
            <div className="avatar-wrapper">
                <img
                    src="/react.svg"
                    alt="avatar"
                    className="avatar-img"
                />
                <span className="status-dot"></span>
            </div>

            <div className="user-text">
                <span className="user-name">{username}</span>
            </div>
        </div>
    )
}

export default UserInfor
