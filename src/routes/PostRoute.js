import React from "react";
import LoadingSpinner from "../atomics/LoadingSpinner";
import { useLoaderData } from "react-router-dom";
import MarkdownBox from "../atomics/MarkdownBox";

const postLoader = async ({ params }) => {
  const response = await fetch(`/posts/${params.postId}/post.md`);
  return response.text();
};

export default function PostRoute() {
  const postData = useLoaderData();

  if (!postData) {
    return <LoadingSpinner />;
  }

  return <MarkdownBox data={postData} />;
}

export { PostRoute, postLoader };
