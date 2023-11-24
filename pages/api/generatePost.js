import { withApiAuthRequired } from "@auth0/nextjs-auth0";
import { Configuration, OpenAIApi } from "openai"

export default withApiAuthRequired(async function handler(req, res) {
  const config = new Configuration({
    apiKey: process.env.OPENAI_API_KEY
  });
  const { topic, keywords } = req.body;


  const openai = new OpenAIApi(config);
  // const response = await openai.createCompletion({
  //   model: "text-davinci-003",
  //   temperature: 0,
  //   max_tokens: 3600,
  //   prompt: `write a long and detail SEO-friendly blog post about ${topic}, that targets the following comma-separated keywords: ${keywords}.
  //   The content should be formatted in SEO-friendly HTML.
  //   The response must also include appropriate HTML title and meta description content.
  //   The return format must be stringified JSON in the following format:
  //   {
  //     "postContent": post content here
  //     "title": title goes here
  //     "metaDescription": meta description goes here
  //   } `,
  // })
  const postContentresponse = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    temperature: 0,
    messages: [{
      role: "system",
      content: "You are a blog generator"
    }, {
      role: "user",
      content: `write a long and detail SEO-friendly blog post about ${topic},
       that targets the following comma-separated keywords: ${keywords}.
       The content should be formatted in SEO-friendly HTML,
      limited to the following HTML tags:p,h1,h2,h3,h4,h5,h6, strong, li,ol,ul,i `
    },
    ],
  });


  // res.status(200).json({
  //   post: JSON.parse(response.data.choices[0]?.message?.content.split("\n").join(""))
  // });

  // };
  const postContent = postContentresponse.data.choices[0]?.message?.content || "";
  const postTitleresponse = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    temperature: 0,
    messages: [{
      role: "system",
      content: "You are a blog generator"
    }, {
      role: "user",
      content: `write a long and detail SEO-friendly blog post about ${topic},
       that targets the following comma-separated keywords: ${keywords}.
       The content should be formatted in SEO-friendly HTML,
      limited to the following HTML tags:p,h1,h2,h3,h4,h5,h6, strong, li,ol,ul,i `
    }, {
      role: "assistant",
      content: postContent
    }, {
      role: "user",
      content: `Generate appropriate title tag text for the above blog post`
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
      role: "user",
      content: `write a long and detail SEO-friendly blog post about ${topic},
       that targets the following comma-separated keywords: ${keywords}.
       The content should be formatted in SEO-friendly HTML,
      limited to the following HTML tags:p,h1,h2,h3,h4,h5,h6, strong, li,ol,ul,i `
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

  res.status(200).json({
    post: {
      postContent,
      title,
      metaDescription,
    },
  });

  // res.status(200).json({
  //   post: JSON.parse(response.data.choices[0]?.message?.content.split("\n").join(""))
  // });

});
