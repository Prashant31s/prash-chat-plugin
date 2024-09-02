"use client";
import React, { useEffect, useState } from "react";
import socket from "../components/connect";
import { useRouter,useSearchParams } from "next/navigation";
import { getRandomColor } from "../utils/colors";
import { createBrowserHistory } from "history";

function Chatroom(data) {
  const [mesuser, setMesuser] = useState([]);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [socketID, setSocketID] = useState("");
  const searchParams = useSearchParams();
  const router= useRouter();
  const user = searchParams.get("user");
  const history = createBrowserHistory();
  const [allow, setAllow] =useState(false);

  const newroom = searchParams.get("room");
  const [room, setRoom] = useState(newroom);
  // const [backgroundcolor, setbackgroundcolor] = useState("#000000");
  const [activeDropdown, setActiveDropdown] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message) {
      socket.emit("message", { message, room, user });
    }
    setMessage("");
  };

  const handleEdit = (messageId, currentContent) => {
    const newContent = prompt("Edit your message:", currentContent);
    if (newContent) {
      socket.emit("edit-message", { messageId, newContent, userId: socketID });
    }
    setActiveDropdown(null);
  };

  const handleDelete = (messageId) => {
    socket.emit("delete-message", { messageId, userId: socketID });
    setActiveDropdown(null);
  };

  useEffect(() => {
    history.listen((update) => {
      if (update.action === "POP") {
        socket.emit("back-button-leave", socket.id);
      }
    });
  }, []);

  useEffect(() => {
    socket.emit("username", { user });
    socket.on("duplicate username", (m) => {
      router.push(`/`);
      setAllow(false);
      console.log("not approved")
    });

    socket.on("approved username", () => {
      //setUsernameApproved(true);
      setAllow(true);
      console.log("approved");
    });
    return () => {
      socket.off("duplicate username");
      socket.off("username approved");
    };
  }, [user, router]);

  useEffect(() => {
    // setbackgroundcolor(getRandomColor());
    if(!allow){
      return;
    }
    setSocketID(socket.id);
    socket.on("connect", () => {
      setSocketID(socket.id);
    });
    socket.emit("join-room", newroom);
    socket.on("history", (messages) => {
      let mes = messages.map((msg) => ({
        id: msg._id,
        nmessages: msg.message,
        ruser: msg.user,
      }));
      setMesuser(mes);
    });
  }, [allow]);

  useEffect(() => {
    if(!allow){
      return
    }
    socket.on("receive-message", ({ message, user, _id }) => {
      setMesuser((prevMesuser) => [
        ...prevMesuser,
        { id: _id, nmessages: message, ruser: user },
      ]);
      setMessages((messages) => [...messages, message]);
    });

    socket.on("message-edited", ({ messageId, newContent }) => {
      setMesuser((prevMesuser) =>
        prevMesuser.map((msg) =>
          msg.id === messageId ? { ...msg, nmessages: newContent } : msg
        )
      );
    });

    socket.on("message-deleted", ({ messageId }) => {
      setMesuser((prevMesuser) =>
        prevMesuser.filter((msg) => msg.id !== messageId)
      );
    });

    return () => {
      socket.off("receive-message");
      socket.off("message-edited");
      socket.off("message-deleted");
    };
  }, [mesuser,allow]);

  const toggleDropdown = (messageId) => {
    setActiveDropdown(activeDropdown === messageId ? null : messageId);
  };

  return (
    <div className="w-screen bg-accent h-screen">
      <div className="rounded-2xl items-center justify-center text-center text-2xl">
        <h1 className="p-2 m-1 text-heading">{user}</h1>

        <div className="flex flex-col justify-end border-[2.5px] border-white rounded-[30px] bg-black w-[50vw] min-w-[750px] h-[90vh] mx-auto my-4 bg-background">
          <div className="flex flex-col-reverse p-3 mt-5 mr-2 overflow-auto scrollbar-thin scrollbar-thumb-rounded-sm scrollbar-thumb-black">
            <div className="flex flex-col gap-3 p-2">
              {mesuser.map((msg, index) =>
                msg.ruser === user ? (
                  <div
                    key={index}
                    className="relative bg-primary flex flex-row self-end max-w-xs border-[1px] border-black rounded-[25px] p-1"
                  >
                    <p className="text-wrap m-1 word">{msg.nmessages}</p>
                    <button
                      onClick={() => toggleDropdown(msg.id)}
                      className="mr-[10px] text-xl"
                    >
                      ⋮
                    </button>
                    {activeDropdown === msg.id && (
                      <div className=" bg-white border rounded shadow-lg z-10 text-xs w-[42px] mr-[5px] my-1">
                        <button
                          onClick={() => {
                            handleEdit(msg.id, msg.nmessages);
                          }}
                          className="block px-[5px] py-[3px] text-black hover:bg-gray-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            handleDelete(msg.id);
                          }}
                          className="block px-[2px] py-[3px] text-red-500 hover:bg-joinbutton2 rounded-[3px]"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    key={index}
                    className="bg-secondary flex flex-col max-w-xs border-[1px] border-text rounded-[25px] w-fit"
                  >
                    {msg.ruser ===
                      mesuser[index - 1 > 0 ? index - 1 : 0].ruser &&
                    index != 0 ? (
                      <span className="m-0.5 bg-secondary pl-1 pr-1  text-black rounded-2xl text-wrap word overflow-x-auto ">
                        {msg.nmessages}
                      </span>
                    ) : (
                      <div className="flex flex-col">
                        <span
                          className={`pt-1 pl-1 pr-1  mt-0 text-[20px] font-bold text-black `}
                        >
                          
                          {msg.ruser} :
                        </span>
                        <span className=" mb-[2px] pl-1 pr-1 pb-1 text-black rounded-xl text-wrap word overflow-x-auto ">
                          {msg.nmessages}
                        </span>
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          </div>

          <form className="form" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Enter message"
              className="input"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button type="submit" className="">
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Chatroom;
