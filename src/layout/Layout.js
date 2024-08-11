import React from "react";
import { Container, Grid, Link, Typography } from "@mui/material";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import strings from "../config/strings";

function Layout() {
  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h3" component="h3" sx={{ mb: 2 }}>
        <Link href={`/`} variant="h3" sx={{ textDecoration: "none" }}>
          {strings.siteTitle}
        </Link>
      </Typography>
      <Grid container maxWidth={"xl"} spacing={3}>
        {/* Sidebar */}
        <Grid item xs={3}>
          <Sidebar />
        </Grid>

        {/* Main Content */}
        <Grid item xs={9}>
          <Outlet />
        </Grid>
      </Grid>
    </Container>
  );
}

export default Layout;
