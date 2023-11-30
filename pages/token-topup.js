import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { AppLayout } from "../components/AppLayout";
import { getAppProps } from "../utils/getAppProps";

export default function TokenTopup() {

    const handleClick = async () => {
        const result = await fetch('/api/addtokens', {
            method: 'POST',

        });
        const json = await result.json();
        console.log("result", json)
        window.location.href = json.session.url;
    };

    return <div >
        <h1>tokens available are so less
            <button className="btn" onClick={handleClick}>Add Tokens</button>
        </h1>
    </div>;
}
TokenTopup.getLayout = function getLayout(page, pageProps) {
    return <AppLayout {...pageProps}>{page}</AppLayout>;
}
export const getServerSideProps = withPageAuthRequired({
    async getServerSideProps(ctx) {
        const props = await getAppProps(ctx);
        return {
            props
        }
    }
})