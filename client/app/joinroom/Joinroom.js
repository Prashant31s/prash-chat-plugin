"use client";
import React, { useState } from "react";
import socket from "../components/connect";
import { useRouter, useSearchParams } from "next/navigation";

function Joinroom() {
  const [roomName, setRoomName] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = searchParams.get("username");
  function joinRoom() {
    console.log(`Room ${roomName} joined`);
    if (roomName) {
      router.push(`/Chatroom?user=${user}&room=${roomName}`);
    }
  }
  return (
    <>
      <div className="  m-[5px] mt-2">
        <div className="flex  justify-center items-center text-center border-2 border-black rounded-lg h-11">
          <h6 className="font-serif font-semibold rounded-lg text-pretty text-2xl ">
            {user}
          </h6>
        </div>
        <div className="flex flex-wrap items-center justify-center p-2 m-4 ">
          <h4 className="flex flex-wrap items-center justify-center">
            Join room
          </h4>
          <input
            className="p-2 m-2 text-black bg-gray-300 shadow-md rounded-xl w-1/8 "
            style={{ border: "1px solid black" }}
            placeholder="Room name"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
          />
          <button
            className="p-2 m-2 font-semibold bg-heading text-text2 bg-joinbutton w-28 hover:bg-joinbutton2 border-b-[4px]  border-joinbutton2 rounded-2xl "
            onClick={() => joinRoom()}
          >
            join
          </button>
        </div>
      </div>
    </>
  );
}
export default Joinroom;
