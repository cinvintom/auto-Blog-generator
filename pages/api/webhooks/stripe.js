import verifyStripe from "@webdeveducation/next-verify-stripe";
import Cors from "micro-cors";
import stripeInit from 'stripe';
import clientPromise from "../../../lib/mongodb";

const cors = Cors({
    allowMethods: ['POST', 'HEAD']
});

export const config = {
    api: {
        bodyParser: false
    }
}
const stripe = stripeInit(process.env.STRIPE_SECRET_KEY)
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

const handler = async (req, res) => {
    if (req.method === 'POST') {
        let event;
        try {
            event = verifyStripe({
                req,
                stripe,
                endpointSecret
            });
        } catch (e) {
            console.error("ERROR: ", e);
            return res.status(400).json({ error: 'Webhook verification failed' });
        }

        switch (event.type) {
            case 'payment_intent.succeeded': {
                const client = await clientPromise;
                const db = client.db("BlogStandard");

                const paymentIntent = event.data.object;
                const auth0Id = paymentIntent.metadata.sub;

                try {
                    const userProfile = await db.collection("users").updateOne(
                        { auth0Id },
                        {
                            $inc: { availableTokens: 10 },
                            $setOnInsert: { auth0Id },
                        },
                        { upsert: true }
                    );

                    console.log('User profile updated:', userProfile);
                } catch (error) {
                    console.error('Error updating user profile:', error);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }
                break;
            }
            default:
                console.log('Webhook Event:', event);

                console.log('UNHANDLED EVENT: ', event.type);
        }

        res.status(200).json({ received: true });
    }
};

export default cors(handler);