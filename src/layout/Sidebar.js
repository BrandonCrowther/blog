import React from "react";
import postList from "../config/postList";
import { Link } from "@mui/material";

export default function Sidebar() {
  return (
    <div>
      <ul>
        {postList.map((p, i) => (
          <li key={p.title}>
            <Link href={`/post/${i + 1}`}>{p.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
