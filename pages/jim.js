import { withPageAuthRequired } from "@auth0/nextjs-auth0";

export default function Home() {
    return <div >
      <h1>Hello this is my Second Next.js</h1>
    </div>;
  }
  export const getServerSideProps = withPageAuthRequired(() => {
    return {
        props: {}
    }
})