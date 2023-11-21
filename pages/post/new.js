import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { AppLayout } from "../../components/AppLayout";

export default function NewPost(props) {
    console.log('new post', props)
    return <div >
        <h1>Hello this is my new post Next.js</h1>
        <h3>How are you</h3>
    </div>;
}

NewPost.getLayout = function getLayout(page, pageProps) {
    return <AppLayout {...pageProps}>{page}</AppLayout>;
}

export const getServerSideProps = withPageAuthRequired(() => {
    return {
        props: {}
    }
})