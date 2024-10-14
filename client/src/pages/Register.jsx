import React from 'react';
import { useState } from "react";
import axios from 'axios';
import useTitle from '../components/useTitle';

import { useNavigate, Link } from 'react-router-dom';

import { useDispatch } from "react-redux";
import { loginStart, loginSuccess, loginFailure } from "../redux/userSlice";

import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Register = () => {

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [email, setEmail] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [address, setAddress] = useState("")
  const [error, setError] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState({}); // Track individual field errors

  const axiosInstance = axios.create({
    baseURL:process.env.REACT_APP_API_URL,
    withCredentials: true
  });


  const navigate = useNavigate();
  const dispatch = useDispatch();

  useTitle('eNSAYO | Register')

  const handleSignup = async (e) => {

    e.preventDefault();
    let formErrors = {};


    try {
      if (!username) formErrors.username = "Username is required";
      else if (username.length > 15) formErrors.username = "Username must be 15 characters or less";
      else if (username.length < 6) formErrors.username = "Username must have at least 6 characters";
      else if (!/^[a-zA-Z0-9_]+$/.test(username)) formErrors.username = "Username must only contain letters, numbers, and underscores";

      const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()-_+=])[0-9a-zA-Z!@#$%^&*()-_+=]{8,}$/;
      if (!password) formErrors.password = "Password is required";
      else if (!passwordRegex.test(password)) formErrors.password = "Invalid password format";

      if (!confirmPassword) formErrors.confirmPassword = "Confirm password is required";
      else if (password !== confirmPassword) formErrors.confirmPassword = "Passwords do not match";

      const emailRegex = /^[a-zA-Z0-9._%+-]{1,254}@[a-zA-Z0-9.-]{1,253}\.[a-zA-Z]{2,}$/;
      if (!email) formErrors.email = "Email is required";
      else if (!emailRegex.test(email)) formErrors.email = "Invalid email address";

      const nameRegex = /^[a-zA-Z ,.-]{1,50}$/;
      if (!firstName) formErrors.firstName = "First name is required";
      else if (!nameRegex.test(firstName)) formErrors.firstName = "Invalid first name";

      if (!lastName) formErrors.lastName = "Last name is required";
      else if (!nameRegex.test(lastName)) formErrors.lastName = "Invalid last name";

      const addressRegex = /^[a-zA-Z0-9.,\s-]{1,255}$/;
      if (!address) formErrors.address = "Address is required";
      else if (!addressRegex.test(address)) formErrors.address = "Invalid address";

      const checkbox = document.getElementById("terms");
      if (!checkbox.checked) formErrors.terms = "Please accept the Data Privacy notice";

      if (Object.keys(formErrors).length > 0) {
        setErrors(formErrors); // Set errors
        return;
      }

      const res = await axiosInstance.post("/auth/signup", { username, password, email, firstName, lastName, address });
    
      dispatch(loginStart()); // Dispatch login start action
      const loginRes = await axiosInstance.post("/auth/signin", { username, password });
      dispatch(loginSuccess(loginRes.data)); // Dispatch login success action

      setUsername("");
      setPassword("");
      setEmail("");
      setFirstName("");
      setLastName("");
      setAddress("");

      console.log("User successfully created");

      navigate('/dashboard');
    } catch (err) {
      if (err.response && err.response.status === 400) {
        if (err.response.data.message === "Username already exists") {
          setError("Username already exists");
        } else if (err.response.data.message === "User with this email already exists") {
          setError("User with this email already exists");
        } else {
          setError(err.response.data.message);
        }
      } else {
        setError(err.message);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gray-100 pt-20 px-4 relative overflow-hidden">
      {/* Graphics */}
      <img
        src="/assets/cones.png"
        alt="Decorative graphic"
        className="absolute top-[10px] right-[-150px] w-[300px] sm:w-[400px] md:w-[500px] lg:w-[600px] opacity-90 pointer-events-none z-0"
      />
      <img
        src="/assets/boxes.png"
        alt="Decorative graphic"
        className="absolute bottom-[-200px] sm:bottom-[-230px] md:bottom-[-260px] lg:bottom-[-300px] left-[-45px] w-[300px] sm:w-[400px] md:w-[500px] lg:w-[630px] opacity-90 pointer-events-none z-0"
      />
  
      <div className="absolute top-4 left-4 sm:left-10 sm:top-8 md:left-12 lg:left-16">
        <Link to="/"><img className="h-8 sm:h-10 md:h-12" alt="eNSAYO Logo" src="/assets/ensayo-logo.png" /></Link>
      </div>
  
      <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl bg-white px-6 sm:px-10 md:px-12 lg:px-16 py-8 sm:py-10 md:py-12 lg:py-14 rounded-2xl shadow-custom-dark relative z-10 mb-20 sm:mb-28 md:mb-36 lg:mb-48 mt-10 sm:mt-12 md:mt-14 lg:mt-16">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-sf-bold text-[#2056A8] mb-4 sm:mb-5 md:mb-6 text-center">Create an account</h2>
        <form>
          <div className="mb-4 sm:mb-5 md:mb-6 flex flex-col sm:flex-row items-start sm:items-center">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-sf-bold text-[#2056A8] mb-2 sm:mb-0 sm:mr-4">Login Information</h3>
            <hr className="border-blue-800 border-t-2 w-full flex-1"/>
          </div>

          <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center">
            <label htmlFor="username" className="w-full sm:w-1/3 text-gray-600 font-sf-regular mb-2 sm:mb-0">Username</label>
            <div className="w-full sm:w-2/3">
              <input
                type="text"
                id="username"
                className={`w-full p-2 sm:p-1 border rounded-md font-sf-regular ${errors.username ? 'border-red-500' : 'border-gray-400'}`}
                onChange={e => setUsername(e.target.value)}
              />
              {errors.username && <p className="text-red-500 font-sf-light text-sm mt-1">{errors.username}</p>}
            </div>
          </div>

          <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center">
            <label htmlFor="password" className="w-full sm:w-1/3 text-gray-600 font-sf-regular mb-2 sm:mb-0">Password</label>
            <div className="w-full sm:w-2/3 relative">
              <div className="w-full relative flex items-center">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  className={`w-full p-2 sm:p-1 pr-10 border rounded-md font-sf-regular ${errors.password ? 'border-red-500' : 'border-gray-400'}`}
                  onChange={e => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div> 
              {errors.password && <p className="text-red-500 font-sf-light text-sm mt-1">{errors.password}</p>}
            </div>
          </div>

          <p className="text-gray-500 text-xs mt-1 mb-4 w-full sm:w-2/3 sm:ml-auto font-sf-light">
            The password must have at least 8 characters, at least 1 digit(s), at least 1 lower case letter(s), at least 1 upper case letter(s), at least 1 non-alphanumeric character(s) such as *, -, or #.
          </p>

          <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center">
            <label htmlFor="confirm-password" className="w-full sm:w-1/3 text-gray-600 font-sf-regular mb-2 sm:mb-0">Confirm Password</label>
            <div className="w-full sm:w-2/3">
              <div className="w-full relative flex items-center">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirm-password"
                    className={`w-full p-2 sm:p-1 pr-10 border rounded-md font-sf-regular ${errors.confirmPassword ? 'border-red-500' : 'border-gray-400'}`}
                    onChange={e => setConfirmPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              {errors.confirmPassword && <p className="text-red-500 font-sf-light text-sm mt-1">{errors.confirmPassword}</p>}
            </div>
          </div>

          <div className="mb-4 sm:mb-5 md:mb-6 flex flex-col sm:flex-row items-start sm:items-center">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-sf-bold text-[#2056A8] mb-2 sm:mb-0 sm:mr-4">Personal Information</h3>
            <hr className="border-blue-800 border-t-2 w-full flex-1"/>
          </div>

          <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center">
            <label htmlFor="email" className="w-full sm:w-1/3 text-gray-600 font-sf-regular mb-2 sm:mb-0">Email Address</label>
            <div className="w-full sm:w-2/3">
              <input
                type="text"
                id="email"
                className={`w-full p-2 sm:p-1 border rounded-md font-sf-regular ${errors.email ? 'border-red-500' : 'border-gray-400'}`}
                onChange={e => setEmail(e.target.value)}
              />
              {errors.email && <p className="text-red-500 font-sf-light text-sm mt-1">{errors.email}</p>}
            </div>
          </div>

          <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center">
            <label htmlFor="first-name" className="w-full sm:w-1/3 text-gray-600 font-sf-regular mb-2 sm:mb-0">First Name</label>
            <div className="w-full sm:w-2/3">
              <input
                type="text"
                id="first-name"
                className={`w-full p-2 sm:p-1 border rounded-md font-sf-regular ${errors.firstName ? 'border-red-500' : 'border-gray-400'}`}
                onChange={e => setFirstName(e.target.value)}
              />
              {errors.firstName && <p className="text-red-500 font-sf-light text-sm mt-1">{errors.firstName}</p>}
            </div>
          </div>

          <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center">
            <label htmlFor="last-name" className="w-full sm:w-1/3 text-gray-600 font-sf-regular mb-2 sm:mb-0">Last Name</label>
            <div className="w-full sm:w-2/3">
              <input
                type="text"
                id="last-name"
                className={`w-full p-2 sm:p-1 border rounded-md font-sf-regular ${errors.lastName ? 'border-red-500' : 'border-gray-400'}`}
                onChange={e => setLastName(e.target.value)}
              />
              {errors.lastName && <p className="text-red-500 font-sf-light text-sm mt-1">{errors.lastName}</p>}
            </div>
          </div>

          <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center">
            <label htmlFor="address" className="w-full sm:w-1/3 text-gray-600 font-sf-regular mb-2 sm:mb-0">Address</label>
            <div className="w-full sm:w-2/3">
            <input
                type="text"
                id="address"
                className={`w-full p-2 sm:p-1 border rounded-md font-sf-regular ${errors.address ? 'border-red-500' : 'border-gray-400'}`}
                onChange={e => setAddress(e.target.value)}
              />
              {errors.address && <p className="text-red-500 font-sf-light text-sm mt-1">{errors.address}</p>}
            </div>
          </div>

          <div className="mb-4 sm:mb-5 md:mb-6 flex flex-col sm:flex-row items-start sm:items-center">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-sf-bold text-[#2056A8] mb-2 sm:mb-0 sm:mr-4">Data Privacy</h3>
            <hr className="border-blue-800 border-t-2 w-full flex-1"/>
          </div>

          <div className="mb-6 flex items-start px-2 sm:px-4 md:px-10 py-1">
            <input
              type="checkbox"
              id="terms"
              className="mr-2 mt-1"
            />
            <label htmlFor="terms" className="text-gray-500 text-xs sm:text-sm md:text-base font-sf-regular">I hereby allow TESDA to use/post my contact details, name, email, cell phone/landline nos. and other information I provided which may be used for employment opportunities and other purposes.</label>
          </div>

          <div className='flex items-center justify-center'>
            {errors.terms && <p className="text-red-500 font-sf-light text-sm mt-1 mb-6">{errors.terms}</p>}
            {error && <p className="text-red-500 font-sf-light text-sm mt-1 mb-6">{error}</p>}
          </div>


          <div className="flex items-center justify-center">
            <button
              type="submit"
              className="bg-[#2056A8] hover:bg-blue-700 text-white font-sf-regular py-2 sm:py-2.5 md:py-3 px-8 sm:px-10 md:px-12 rounded-full focus:outline-none focus:shadow-outline"
              onClick={handleSignup}
            >
              Create Account
            </button>
          </div>
          <div className="text-center mt-4 sm:mt-5">
            <a href="/login" className="text-blue-800 hover:text-blue-600 font-sf-regular text-sm sm:text-base">Already have an account? Sign in ↗</a>
          </div>
        </form>
      </div>
    </div>
  );
  
};

export default Register;
