import CommunityHub from "@/components/one";
import { Suspense } from "react";
export default function Home() {
  return (
   <>
   <Suspense fallback={<div>Loading...</div>}>
   <CommunityHub/>
   </Suspense>
   </>
  );
}
