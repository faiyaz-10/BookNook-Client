import BookDetails from "@/components/book-details";
import PrivatePage from "@/components/private-page";
export async function generateMetadata(){return {title:"BookNook | Book Details"}}
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;return <PrivatePage path={`/books/${id}`}><BookDetails id={id}/></PrivatePage>}
