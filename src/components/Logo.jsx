import React from 'react'
import logo from "../assets/logo.png";


function Logo() {
  return (
    <div>
      <img src={logo} alt="logo" className="rounded-full h-10 w-10" />
    </div>
  );
}

export default Logo