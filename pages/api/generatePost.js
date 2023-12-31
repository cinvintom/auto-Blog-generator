import { getSession, withApiAuthRequired } from "@auth0/nextjs-auth0";
import { Configuration, OpenAIApi } from "openai"
import clientPromise from "../../lib/mongodb";

export default withApiAuthRequired(async function handler(req, res) {
  const { user } = await getSession(req, res);
  const client = await clientPromise;
  const db = client.db("BlogStandard");
  const userProfile = await db.collection("users").findOne({
    auth0Id: user.sub
  });

  if (!userProfile?.availableTokens) {
    res.status(403);
    return;
  }

  const config = new Configuration({
    apiKey: process.env.OPENAI_API_KEY
  });
  const { topic, keywords } = req.body;


  const openai = new OpenAIApi(config);
  const postContentresponse = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    temperature: 0,
    messages: [{
      role: "system",
      content: "You are a blog generator"
    }, {
      role: "user",
      content: `write a long and detailed SEO-friendly blog post about ${topic},
       that targets the following comma-separated keywords: ${keywords}.also include a small conclusion.
       The content should be formatted in SEO-friendly HTML,
      limited to the following HTML tags:p,h1,h2,h3,h4,h5,h6, strong, li,ol,ul,i `
    },
    ],
  });


  const postContent = postContentresponse.data.choices[0]?.message?.content || "";
  const postTitleresponse = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    temperature: 0,
    messages: [{
      role: "system",
      content: "You are a blog generator"
    },{
      role: "assistant",
      content: postContent
    }, {
      role: "user",
      content: `Generate appropriate title text for the above blog post`
    },
    ],
  });

  const metaDescriptionresponse = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    temperature: 0,
    messages: [{
      role: "system",
      content: "You are a blog generator"
    }, {
      role: "assistant",
      content: postContent
    }, {
      role: "user",
      content: `Generate SEO friendly meta description content for the above blog post`
    },
    ],
  });

  const title = postTitleresponse.data.choices[0]?.message?.content || "";
  const metaDescription = metaDescriptionresponse.data.choices[0]?.message?.content || "";

  console.log('POST CONTENT : ', postContent);
  console.log('TITLE : ', title);
  console.log('META DESCRIPTION:', metaDescription);

  await db.collection("users").updateOne({
    auth0Id: user.sub
  }, {
    $inc: {
      availableTokens: -1
    }
  });

  const post = await db.collection("posts").insertOne({
    postContent: postContent.split('\n').join(''),
    title: title.split('\n').join(''),
    metaDescription: metaDescription.split('\n').join(''),
    topic,
    keywords,
    userId: userProfile._id,
    created: new Date(),
  });



  res.status(200).json({
    postId: post.insertedId,
  });


});
