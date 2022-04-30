import React from "react";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import VideocamIcon from "@mui/icons-material/Videocam";

export default function Tab({ type }) {
  return (
    <div className='flex flex-col mx-4'>
      <div className='flex  items-center justify-center hover:cursor-pointer hover:bg-white hover:text-black text-white bg-black border-2 border-white w-[30px] p-6 m-2'>
        {type === "video" ? <VideocamIcon /> : <SportsEsportsIcon />}
      </div>
    </div>
  );
}
