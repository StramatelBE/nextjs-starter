'use client';

import { Box, Grid, IconButton, Paper, Stack, Typography } from "@mui/material";
import { ReactNode } from "react";

interface ContainerProps {
    icon: ReactNode;
    title: ReactNode;
    content: ReactNode;
    headerRight?: ReactNode;
    headerLeft?: ReactNode;
}

export default function Container({
                                      icon,
                                      title,
                                      content,
                                      headerRight,
                                      headerLeft
                                  }: ContainerProps) {
    return (
        <Grid item xs={12}>
            <Paper className="mainPaperPage">
                <Stack className="herderTitlePage">
                    <Box className="headerLeft">
                        {headerLeft}
                        <IconButton disabled className="headerButton">
                            {icon}
                        </IconButton>
                        <Typography
                            variant="h6"
                            sx={{ color: "text.primary" }}
                            className="headerTitle"
                        >
                            {title}
                        </Typography>
                    </Box>
                    <Box className="headerRight">{headerRight}</Box>
                </Stack>
                <Box className="containerPage" style={{ alignItems: "center" }}>
                    {content}
                </Box>
            </Paper>
        </Grid>
    );
}