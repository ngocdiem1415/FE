import {Routes, Route, Navigate} from "react-router-dom";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import ChatPage from "./pages/ChatPage";

const App = () => {
    const user = localStorage.getItem("user");

    return (
        <Routes>
            if
            <Route path="/login" element={<LoginPage/>} />
            <Route path="/register" element={<RegisterPage/>}/>
            {/*<Route*/}
            {/*    path="/login"*/}
            {/*    element={user ? <Navigate to="/chat" replace/> : <LoginPage/>}*/}
            {/*/>*/}
            <Route
                path="/chat"
                element={user ? <ChatPage/> : <Navigate to="/login" replace/>}
            />
            {/*<Route path="/chat" element={<ChatPage/>}/>*/}

            <Route path="/" element={<Navigate to="/login" replace/>}/>
        </Routes>
    );
};

export default App;
