import { withPageAuthRequired } from "@auth0/nextjs-auth0";

export default function Post() {
    return <div >
      <h1>Hello this is my new post page Next.js</h1>
      <h3>How are you</h3>
    </div>;
  }
  export const getServerSideProps = withPageAuthRequired(() => {
    return {
        props: {}
    }
})