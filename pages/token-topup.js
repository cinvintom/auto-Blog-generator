import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { AppLayout } from "../components/AppLayout";

export default function TokenTopup() {

    const handleClick = async () => {
        await fetch('/api/addtokens', {
            method: 'POST',

        });
    }

    return <div >
        <h1>tokens available are so lesss
            <button className="btn" onClick={handleClick}>Add Tokens</button>
        </h1>
    </div>;
}
TokenTopup.getLayout = function getLayout(page, pageProps) {
    return <AppLayout {...pageProps}>{page}</AppLayout>;
}
export const getServerSideProps = withPageAuthRequired(() => {
    return {
        props: {}
    }
})