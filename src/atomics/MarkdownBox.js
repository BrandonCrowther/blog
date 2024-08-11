import { Typography } from "@mui/material";
import React from "react";
import Markdown from "react-markdown";

export default function MarkdownBox(props) {
  const { data } = props;
  return (
    <Typography component={"div"}>
      <Markdown>{data}</Markdown>
    </Typography>
  );
}
