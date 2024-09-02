"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import socket from "./components/connect";

export default function Home() {
  const [usernames, setUsernames] = useState([]);
  const [userName, setUsername] = useState("");
  const [takenName, setTakenName] = useState(true);

  const router = useRouter();

  function userjoin() {
    if (userName) {
      socket.emit("username", { userName });
      socket.on("approved username", () => {
        router.push(`./joinroom?username=${userName}`);
      });
      socket.on("duplicate username", (m) => {
        setTakenName(`username ${m.userName} is taken`);
      });
    }
  }
  useEffect(() => {
    console.log("userlen", usernames.length);
    console.log("USerNames usestate", usernames);
  }, [usernames]);

  return (
    <>
    <div className="flex flex-col items-center justify-center h-screen bg-accent">
    <div className="flex flex-col justify-center items-center m-auto  border-2  bg-background">
        <input
          className="flex p-2 m-2 mb-0"
          placeholder="username"
          value={userName}
          onChange={(e) => setUsername(e.target.value)}
        />
        {!takenName ? "" : <span className="p-2 text-wrap">{takenName}</span>}

        <button
          className="p-4 m-3 bg-joinbutton hover:bg-joinbutton2  border-b-4 border-joinbutton2 border-l-green-700 rounded-[25px]"
          onClick={() => userjoin()}
        >
          room chat
        </button>
      </div>
    </div>
      
    </>
  );
}
