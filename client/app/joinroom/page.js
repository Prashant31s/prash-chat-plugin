"use client"
import React, { useEffect } from 'react'
import Joinroom from './Joinroom'


function page() {
    // useEffect(()=>{
    //     document.body.style("green");
    // },[])
  return (
    <div className='flex bg-accent h-[100vh] items-center justify-center '>

    <div className='flex bg-background justify-center border-2 rounded-2xl'>
        <Joinroom/>
    </div>

    </div>
    
  )
}

export default page