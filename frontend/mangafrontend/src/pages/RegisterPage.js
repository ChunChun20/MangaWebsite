import React, { useState } from "react";
import axios from 'axios';
import {useNavigate} from "react-router-dom";
import "./RegisterPage.css"
 
export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [usernameError, setUsernameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const navigate = useNavigate();

  const registerUser = () => {
     let isValid = true
    
     if(username.length < 3 || username.length > 80){
       setUsernameError('Username must be at least 3 characters.');
       isValid = false;
      } else {
         setUsernameError(''); 
      }
    if(password.length < 6 || password.length > 80){
       setPasswordError('Password must be at least 6 characters.');
        isValid = false;
      } else {
       setPasswordError(''); 
       }
   if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
       setEmailError('Please enter a valid email address.');
        isValid = false;
       } else {
       setEmailError(''); 
       }


      if (isValid) {
           axios.post('http://127.0.0.1:5000/sign-up', {
               username: username,
               email: email,
               password: password
           })
           .then(function (response) {
               console.log(response);
               navigate("/");
           })
           .catch(function (error) {
             console.log(error, 'error');
               if (error.response && error.response.status === 400) {
                  if(error.response.data.message === 'Username already exists'){
                   setUsernameError("Username already exists");
                   }
                  else if(error.response.data.message === 'Email already exists'){
                    setEmailError("Email already exists");
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

  };



  return (
    <div className="register-container">
    <div className="register-form-container">
          <h2 className="register-form-title">Create Your Account</h2>
       
       <form>
           <div className="form-outline mb-3">
              <input type="username" value={username} onChange={(e) => setUsername(e.target.value)} id="form3Example5"
                className="form-control form-control-lg" placeholder="Enter Username"  required/>
                <label className="form-label" htmlFor="form3Example5">Username</label>
               {usernameError &&  <div className="text-danger">{usernameError}</div>}

            </div>

           <div className="form-outline mb-4">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} id="form3Example3"
                    className="form-control form-control-lg" placeholder="Enter a valid email address" required/>
               <label className="form-label" htmlFor="form3Example3">Email address</label>
                {emailError && <div className="text-danger">{emailError}</div>}
           </div>


          <div className="form-outline mb-3">
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} id="form3Example4"
                   className="form-control form-control-lg" placeholder="Enter password" required/>
                <label className="form-label" htmlFor="form3Example4">Password</label>
              {passwordError &&  <div className="text-danger">{passwordError}</div>}
         </div>

              <div className="register-actions">
                   <div className="form-check mb-0">
                          <input className="form-check-input me-2" type="checkbox" value=""
                                  id="form2Example3"/>
                           <label className="form-check-label" htmlFor="form2Example3">
                              Remember me
                            </label>
                   </div>
                   <a href="#!" className="text-body">Forgot password?</a>
              </div>

          <div className="text-center text-lg-start mt-4 pt-2">
               <button type="button" className="register-button"  onClick={() => registerUser()}>Sign Up</button>
                <p className="small fw-bold mt-2 pt-1 mb-0 login-link">Login to your account <a href="/login"
                              className="link-danger">Login</a>
                 </p>
           </div>
         </form>
    </div>
</div>
  );
}