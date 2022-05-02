import React from "react";
import Tab from "../../components/tab/Tab";

export default function Home() {
  return (
    <div className='bg-black h-[100vh]'>
      <div className='flex w-full h-full items-center justify-center'>
        <a href='https://videocallcn.herokuapp.com'>
          <Tab type={"video"} />
        </a>
        <a href='https://fun-time-app.herokuapp.com/'>
          <Tab type={"game"} />
        </a>
      </div>
    </div>
  );
}
