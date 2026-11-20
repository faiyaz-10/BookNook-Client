import AddBookPage from "@/components/add-book-page"; 
import PrivatePage from "@/components/private-page"; 
export const metadata={title:"BookNook | Add Book"}; 
export default function Page(){return <PrivatePage path="/add-book"><AddBookPage/></PrivatePage>}
