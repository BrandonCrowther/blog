import React from "react";
import LoadingSpinner from "../atomics/LoadingSpinner";
import postList from "../config/postList";
import { useLoaderData } from "react-router-dom";
import MarkdownBox from "../atomics/MarkdownBox";

const homeLoader = async () => {
  const postData = postList
    .map(async (_, i) => {
      const response = await fetch(`/posts/${i + 1}/post.md`);
      const toText = await response.text();
      return toText;
    })
    .reverse();
  return await Promise.all(postData);
};

export default function HomeRoute() {
  const postData = useLoaderData();

  if (!postData) {
    return <LoadingSpinner />;
  }

  return postData.map((post, i) => <MarkdownBox key={i} data={post} />);
}

export { HomeRoute, homeLoader };
