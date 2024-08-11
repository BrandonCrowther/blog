import React from "react";
import { createBrowserRouter } from "react-router-dom";
import Layout from "../layout/Layout";
import { PostRoute, postLoader } from "../routes/PostRoute";
import { HomeRoute, homeLoader } from "../routes/HomeRoute";

const router = createBrowserRouter([
  {
    path: "*",
    element: <Layout />,
    children: [
      {
        path: "*",
        element: <HomeRoute />,
        loader: homeLoader,
      },
      {
        path: "post/:postId",
        element: <PostRoute />,
        loader: postLoader,
      },
    ],
  },
]);

export default router;
