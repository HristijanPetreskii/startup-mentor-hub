import { useContext } from "react";
import { AuthContext } from "./AuthContext";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    return (
        <nav>
            {user ? (
                <>
                    <span>Welcome, {user.email}</span>
                    <button onClick={() => {
                        logout();
                        navigate("/login");
                    }}>
                        Logout
                    </button>
                </>
            ) : (
                <button onClick={() => navigate("/login")}>Login</button>
            )}
        </nav>
    );
};

export default Navbar;
