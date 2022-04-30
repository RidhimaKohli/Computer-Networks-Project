import React from "react";
import Tab from "../../components/tab/Tab";

export default function Home() {
  return (
    <div className='bg-black h-[100vh]'>
      <div className='flex w-full h-full items-center justify-center'>
        <Tab type={"video"} />
        <Tab type={"game"} />
      </div>
    </div>
  );
}
