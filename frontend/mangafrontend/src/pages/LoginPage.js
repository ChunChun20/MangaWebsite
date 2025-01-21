import React, { useState } from "react";
import axios from 'axios';
import {useNavigate} from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "./LoginPage.css"
 
export default function LoginPage( {setUser} ){
 
    const [username,setUsername] = useState('');
    const [password,setPassword] = useState('');

    const [usernameError,setUsernameError] = useState('');
    const [passwordError,setPasswordError] = useState('');

   
    const navigate = useNavigate();
     
    const logInUser = () => {
      let isValid = true;


        if(username.length === 0){
          setUsernameError("Username cannot be empty!");
          isValid = false;
        }
        if(password.length === 0){
          setPasswordError("Password cannot be empty!");
          isValid = false;
        }
        if (isValid) {
            axios.post('http://127.0.0.1:5000/login', {
                username: username,
                password: password
            })
            .then(function (response) {
                const token = response.data.accessToken;
                localStorage.setItem("token",token);
                const decodedToken = jwtDecode(token);
                setUser(decodedToken);
                navigate("/");
            })
            .catch(function (error) {
              if (error.response && error.response.status === 400) {
                if(error.response.data.error === 'Invalid username or password'){
                 setUsernameError("Invalid username or password");
                 setPasswordError("Invalid username or password");
                 }
              }
               else if (error.response && error.response.status === 401) {
                  alert("Invalid credentials");
              }
              else {
              alert("Unexpected error");
              }
            });
        }
        
    }
 
    
  return (
    <div className="login-container">
    <div className="login-form-container">
        <h2 className="login-form-title">Log Into Your Account</h2>
        <form>
            <div className="form-outline mb-4">
                <input type="username" value={username} onChange={(e) => setUsername(e.target.value)} id="form3Example3" className="form-control form-control-lg" placeholder="Enter a valid username" required/>
                 <label className="form-label" htmlFor="form3Example3">Username</label>
                {usernameError && <div className="text-danger">{usernameError}</div>}
            </div>
            <div className="form-outline mb-3">
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} id="form3Example4" className="form-control form-control-lg" placeholder="Enter password" required />
                 <label className="form-label" htmlFor="form3Example4">Password</label>
                {passwordError && <div className="text-danger">{passwordError}</div>}
             </div>

             <div className="login-actions">
                  <div className="form-check mb-0">
                    <input className="form-check-input me-2" type="checkbox" value="" id="form2Example3" />
                     <label className="form-check-label" htmlFor="form2Example3">Remember me</label>
                   </div>
                   <a href="#!" className="text-body">Forgot password?</a>
                </div>
             <div className="text-center text-lg-start mt-4 pt-2">
                   <button type="button" className="login-button" onClick={logInUser}>Login</button>
                    <p className="small fw-bold mt-2 pt-1 mb-0 register-link">
                        Don't have an account? <a href="/register" className="link-danger">Register</a>
                   </p>
             </div>

        </form>
    </div>
</div>
);
}