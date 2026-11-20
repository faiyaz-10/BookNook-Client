import ProfilePage from "@/components/profile-page";
import PrivatePage from "@/components/private-page";
export const metadata={title:"BookNook | My Profile"};
export default function Page(){return <PrivatePage path="/profile"><ProfilePage/></PrivatePage>}
