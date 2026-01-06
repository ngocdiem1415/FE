import './rightSideBar.css'

const RightSideBar = () => {
    return(
        <div className='rightSideBar'>
            <div className="user">
                <img src="/img/avatar.jpg" alt=""/>
                <h2>OzuSus</h2>
                <p>Lorem ipsum dolor sit amet</p>
            </div>
            <div className="info">
                <div className="option">
                    <div className="title">
                        <span>Chat Setting</span>
                        {/*<img src="/img/arrowUp.png" alt=""/>*/}
                    </div>
                </div>
                <div className="option">
                    <div className="title">
                        <span>Privacy & Help</span>
                        {/*<img src="/img/arrowUp.png" alt=""/>*/}
                    </div>
                </div>
                <div className="option">
                    <div className="title">
                        <span>Photos</span>
                        {/*<img src="/img/arrowDown.png" alt=""/>*/}
                    </div>
                    <div className="photos">
                        <div className="photoItem">
                            <div className="photoDetail">
                                <img
                                    src="https://static0.gamerantimages.com/wordpress/wp-content/uploads/2021/06/Subnautica-Sea-Dragon-1.jpg"
                                    alt=""/>
                                <span>PhotoName</span>
                            </div>
                            <img src="/img/download.png" alt="" className="downloadIcon"/>
                        </div>
                        <div className="photoItem">
                            <div className="photoDetail">
                                <img
                                    src="https://static0.gamerantimages.com/wordpress/wp-content/uploads/2021/06/Subnautica-Sea-Dragon-1.jpg"
                                    alt=""/>
                                <span>PhotoName</span>
                            </div>
                            <img src="/img/download.png" alt="" className="downloadIcon"/>
                        </div>
                        <div className="photoItem">
                            <div className="photoDetail">
                                <img
                                    src="https://static0.gamerantimages.com/wordpress/wp-content/uploads/2021/06/Subnautica-Sea-Dragon-1.jpg"
                                    alt=""/>
                                <span>PhotoName</span>
                            </div>
                            <img src="/img/download.png" alt="" className="downloadIcon"/>
                        </div>
                        <div className="photoItem">
                            <div className="photoDetail">
                                <img
                                    src="https://static0.gamerantimages.com/wordpress/wp-content/uploads/2021/06/Subnautica-Sea-Dragon-1.jpg"
                                    alt=""/>
                                <span>PhotoName</span>
                            </div>
                            <img src="/img/download.png" alt="" className="downloadIcon"/>
                        </div>
                        <div className="photoItem">
                            <div className="photoDetail">
                                <img
                                    src="https://static0.gamerantimages.com/wordpress/wp-content/uploads/2021/06/Subnautica-Sea-Dragon-1.jpg"
                                    alt=""/>
                                <span>PhotoName</span>
                            </div>
                            <img src="/img/download.png" alt="" className="downloadIcon"/>
                        </div>
                    </div>
                </div>
                <div className="option">
                    <div className="title">
                        <span>Files</span>
                        <img src="/img/arrowUp.png" alt=""/>
                    </div>
                </div>
                <button>Block User</button>
                <button className="logOutBtn">Log out </button>
            </div>
        </div>
    )
}
export default RightSideBar