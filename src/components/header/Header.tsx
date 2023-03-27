import Image from "next/image";
import Navbar from "@/components/header/Navbar";
import { useState, MouseEvent } from "react";
import InlineButton from "@/components/misc/InlineButton";
import useAbout from "@/components/about/useAbout";

const profileImageMe =  "/resources/profileMe.webp"
const profileImageDog = "/resources/profileDog.webp"

interface HeaderProps {
    setBackgroundBlurred: (blurred: boolean) => void
}

const Header = ({ setBackgroundBlurred }: HeaderProps) => {
    const about = useAbout()
    const [ profileImageSrc, setProfileImageSrc ] = useState(profileImageMe)
    
    const profileImage = (
        <Image 
            onMouseEnter={(e: MouseEvent) => setProfileImageSrc(profileImageDog)}
            onMouseLeave={(e: MouseEvent) => setProfileImageSrc(profileImageMe)}
            priority
            fill
            src={ profileImageSrc } 
            alt="Profile"
            className="rounded-[2rem] xs:rounded-[2.5rem] border-[6px] sm:border-[5px] border-slate-400"
        />
    )
        
    return (
        <div>
            <div className="flex flex-col gap-5 justify-between">
                <div className="block xs:hidden h-28 w-28 relative mx-auto mt-2">
                    { profileImage }
                </div>
                <h2 className="my-auto">
                    <div className="hidden xs:block xs:h-32 xs:w-32 md:h-30 md:w-30 relative float-right ml-1 sm:ml-2">
                        { profileImage }
                    </div>

                    <div className="markdown">
                        <p className="mb-2">
                            I'm a <InlineButton externalTo="https://bhsec.bard.edu/queens/">BHSEC</InlineButton> student in NYC with a passion for tinkering, coding, Ancient Latin, D&D, strategy board games, creating, designing, engineering, geeking, making, and figuring things out.
                        </p>
                        <p>
                            Information, projects, contacts, my resume, and more can be found on this website. If you have any questions, feel free to <InlineButton externalTo={ `mailto:${about.email}` }>email me!</InlineButton>
                        </p>
                    </div>
                </h2>

                <Navbar setBackgroundBlurred={ setBackgroundBlurred }/>
            </div>
        </div>
    );
}
 
export default Header;
